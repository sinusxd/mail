import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import List

from mail_accounts.models import MailAccount
from mail.schemas import EmailSendRequest
from config import settings  # если есть глобальные настройки
from imap.exceptions import MailServiceException


def send_email(account: MailAccount, email_data: EmailSendRequest):
    """
    Отправка письма через SMTP на основе настроек mail-аккаунта.
    """
    try:
        # Создаем MIME-объект
        msg = MIMEMultipart()
        msg['From'] = formataddr((email_data.sender_name or '', account.mail_email))
        msg['To'] = ', '.join(email_data.recipients)
        msg['Subject'] = email_data.subject or "(без темы)"
        msg.attach(MIMEText(email_data.body, 'html' if email_data.is_html else 'plain'))

        # Подключение к SMTP-серверу
        with smtplib.SMTP_SSL(account.smtp_server, 465) as server:
            server.login(account.mail_email, account.password)
            server.sendmail(
                from_addr=account.mail_email,
                to_addrs=email_data.recipients,
                msg=msg.as_string()
            )

    except smtplib.SMTPException as e:
        raise MailServiceException(f"Ошибка при отправке письма: {str(e)}")
