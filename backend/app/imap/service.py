import imaplib
import email
from base64 import b64encode
from email.utils import parseaddr
from typing import List, Optional
import re

from cryptography.fernet import Fernet
from bs4 import BeautifulSoup

from config import settings
from mail_accounts.models import MailAccount
from imap.exceptions import MailServiceException
from imap.schemas import EmailInfo
from imap.utils import decode_mime_header, add_target_blank
from imap_tools import MailBox, A

fernet = Fernet(settings.ENCRYPTION_KEY)


def connect_imap(mail_account: MailAccount) -> imaplib.IMAP4_SSL:
    decrypted_password = fernet.decrypt(mail_account.password.encode()).decode()
    mail = imaplib.IMAP4_SSL(mail_account.imap_server)
    mail.login(mail_account.mail_email, decrypted_password)
    return mail


def extract_plain_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    return soup.get_text(separator=' ', strip=True)  # type: ignore


def fetch_email_by_uid(mail: imaplib.IMAP4_SSL, uid: str) -> Optional[EmailInfo]:
    result, msg_data = mail.uid('fetch', uid, '(RFC822)')
    if result != 'OK':
        return None

    raw_email = msg_data[0][1]
    msg = email.message_from_bytes(raw_email)

    return parse_email(msg, uid)


def fetch_emails_batch(
        mail_account: MailAccount,
        start_uid: int,
        end_uid: int,
        mailbox: str = "INBOX"
) -> List[EmailInfo]:
    try:
        mail = connect_imap(mail_account)
        mail.select(mailbox)

        search_query = f"UID {start_uid}:{end_uid}"
        result, data = mail.uid('search', None, search_query)
        if result != 'OK':
            mail.logout()
            raise MailServiceException("Не удалось выполнить поиск писем")

        uid_list = data[0].split()
        emails: List[EmailInfo] = []

        for uid_bytes in uid_list:
            uid = uid_bytes.decode()
            email_info = fetch_email_by_uid(mail, uid)
            if email_info:
                emails.append(email_info)

        mail.logout()
        return emails

    except imaplib.IMAP4.error as e:
        raise MailServiceException(f"IMAP ошибка: {str(e)}")
    except Exception as e:
        raise MailServiceException(f"Ошибка: {str(e)}")


from imap_tools import MailBox, AND


def fetch_emails_from_folder(
        account: MailAccount,
        folder_name: str,
        limit: int = 20,
        offset: int = 0
) -> List[EmailInfo]:
    try:
        decrypted_password = fernet.decrypt(account.password.encode()).decode()
        with MailBox(account.imap_server).login(account.mail_email, decrypted_password) as mailbox:
            mailbox.folder.set(folder_name)

            # Получаем письма, отматывая offset и ограничивая limit
            messages = list(mailbox.fetch(reverse=True))[offset:offset + limit]

            emails: List[EmailInfo] = []
            for msg in messages:
                body = msg.html or msg.text or ""
                plain = extract_plain_text_from_html(body)
                snippet = (plain[:60] + "...") if len(plain) > 60 else plain

                email_info = EmailInfo(
                    uid=int(msg.uid),
                    subject=msg.subject or "",
                    sender_name=msg.from_ or "",
                    email_address=msg.from_,  # Можно парсить, если нужно точнее
                    date=str(msg.date),
                    body=body,
                    snippet=snippet
                )
                emails.append(email_info)

            return emails

    except Exception as e:
        raise MailServiceException(f"Ошибка получения писем из папки {folder_name}: {str(e)}")


def get_mail_count(mail_account: MailAccount, mailbox: str = "INBOX") -> int:
    """
    Возвращает количество писем в указанной папке IMAP (по умолчанию INBOX).
    """
    try:
        mail = connect_imap(mail_account)
        result, data = mail.select(mailbox, readonly=True)
        mail.logout()

        if result != "OK":
            raise MailServiceException("Не удалось выбрать папку для подсчёта писем")

        return int(data[0])

    except imaplib.IMAP4.error as e:
        raise MailServiceException(f"IMAP ошибка: {str(e)}")
    except Exception as e:
        raise MailServiceException(f"Ошибка: {str(e)}")


def parse_email(msg: email.message.Message, uid: int) -> EmailInfo:
    subject = decode_mime_header(msg.get('Subject'))
    sender_name, email_address = parseaddr(decode_mime_header(msg.get('From')))
    date_ = msg.get('Date')

    body = ""
    attachments = {}

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get('Content-Disposition') or "")
            content_id = part.get('Content-ID')

            if content_type.startswith('image/') and content_id:
                cid = content_id.strip('<>')
                data = part.get_payload(decode=True)
                if data:
                    b64_data = b64encode(data).decode('utf-8')
                    attachments[cid] = f"data:{content_type};base64,{b64_data}"

            elif content_type == 'text/html' and 'attachment' not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode('utf-8', errors='ignore')

            elif content_type == 'text/plain' and not body and 'attachment' not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode('utf-8', errors='ignore')
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode('utf-8', errors='ignore')

    if attachments:
        body = re.sub(r'cid:<?([^">]+)>?', lambda m: attachments.get(m.group(1), m.group(0)), body)

    body = add_target_blank(body)
    plain = extract_plain_text_from_html(body) if body else ""
    snippet = (plain[:60] + "...") if len(plain) > 60 else plain

    return EmailInfo(
        uid=uid,
        subject=subject,
        sender_name=sender_name,
        email_address=email_address,
        date=date_,
        body=body,
        snippet=snippet
    )


def fetch_folders(account: MailAccount) -> list[str]:
    try:
        decrypted_password = fernet.decrypt(account.password.encode()).decode()
        with MailBox(account.imap_server).login(account.mail_email, decrypted_password) as mailbox:
            return [folder.name for folder in mailbox.folder.list()]
    except Exception as e:
        raise MailServiceException(f"Ошибка получения папок: {str(e)}")


def fetch_email_headers_from_folder(
        account: MailAccount,
        folder_name: str,
        last_uid: int,
        limit: int = 20,
        offset: int = 0
) -> List[EmailInfo]:
    """
    Быстро получает заголовки писем, используя last_uid вместо reverse-поиска.
    """
    try:
        decrypted_password = fernet.decrypt(account.password.encode()).decode()
        with MailBox(account.imap_server).login(account.mail_email, decrypted_password) as mailbox:
            mailbox.folder.set(folder_name)

            # Вычисляем диапазон UID'ов, которые нужно загрузить
            end_uid = last_uid - offset
            start_uid = max(1, end_uid - limit + 1)

            messages = list(mailbox.fetch(
                criteria=A(uid=f"{start_uid}:{end_uid}"),
                headers_only=True,
                bulk=True
            ))

            # сортируем по убыванию UID, т.к. fetch возвращает по возрастанию
            messages.sort(key=lambda m: int(m.uid), reverse=True)

            emails: List[EmailInfo] = []
            for msg in messages:
                snippet = msg.subject or msg.from_ or ""
                snippet = (snippet[:60] + "...") if len(snippet) > 60 else snippet

                email_info = EmailInfo(
                    uid=int(msg.uid),
                    subject=msg.subject or "",
                    sender_name=msg.from_ or "",
                    email_address=msg.from_,
                    date=str(msg.date),
                    body="",  # тело не загружается
                    snippet=snippet
                )
                emails.append(email_info)
            return emails

    except Exception as e:
        raise MailServiceException(f"Ошибка получения заголовков писем из папки {folder_name}: {str(e)}")
