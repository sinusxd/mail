import re

from sqlalchemy.orm import Session

from imap.service import connect_imap, fetch_emails_batch, get_mail_count
from mail.models import Email, Folder
from mail_accounts.models import MailAccount
from utils import parse_email_date


def sync_new_emails(
    db: Session,
    account: MailAccount,
    folder_name: str = "INBOX"
):
    """
    Загружает только новые письма из указанной IMAP-папки и сохраняет их в базу.
    Если писем ещё нет — берёт последние 20 по UID и сохраняет общее количество писем.
    Также обновляет общее количество писем при обычной синхронизации.
    """
    # Убедимся, что папка существует в БД
    folder = (
        db.query(Folder)
        .filter(Folder.account_id == account.id, Folder.name == folder_name)
        .first()
    )
    if not folder:
        folder = Folder(name=folder_name, account_id=account.id)
        db.add(folder)
        db.commit()
        db.refresh(folder)

    mail = connect_imap(account)
    mail.select(folder_name)

    # Получаем UIDNEXT от сервера
    typ, data = mail.status(folder_name, "(UIDNEXT)")
    match = re.search(r"UIDNEXT (\d+)", data[0].decode())
    if not match:
        mail.logout()
        return

    uidnext = int(match.group(1))

    if not account.last_synced_uid or account.last_synced_uid == 0:
        typ, data = mail.uid('search', None, 'ALL')
        all_uids = data[0].split()
        if not all_uids:
            mail.logout()
            return
        max_uid = int(all_uids[-1])
        min_uid = max(1, max_uid - 19)
        new_emails = fetch_emails_batch(account, min_uid, max_uid, mailbox=folder_name)
        account.last_synced_uid = max_uid

        # Получаем общее количество писем и сохраняем
        try:
            account.email_count = get_mail_count(account, mailbox=folder_name)
        except Exception:
            pass

    else:
        # Обычная синхронизация
        start_uid = account.last_synced_uid + 1
        end_uid = uidnext - 1

        if start_uid > end_uid:
            mail.logout()
            return

        new_emails = fetch_emails_batch(account, start_uid, end_uid, mailbox=folder_name)
        account.last_synced_uid = end_uid

        # Пересчитываем общее количество писем
        try:
            account.email_count = get_mail_count(account, mailbox=folder_name)
        except Exception:
            pass

    # Получаем UID'ы уже сохранённых писем
    existing_uids = set(
        r[0] for r in db.query(Email.uid).filter(
            Email.account_id == account.id,
            Email.folder_id == folder.id
        ).all()
    )

    for e in new_emails:
        if e.uid in existing_uids:
            continue

        db.add(Email(
            account_id=account.id,
            uid=e.uid,
            sender_name=e.sender_name,
            sender_email=e.email_address,
            subject=e.subject,
            snippet=e.snippet,
            body=e.body,
            date=parse_email_date(e.date),
            folder_id=folder.id,
        ))

    db.commit()
    mail.logout()