import threading

from sqlalchemy.orm import Session

from database import SessionLocal
from mail.service import get_or_fetch_folders
from . import models, schemas, utils

def create_mail_account(db: Session, user_id: int, mail_account: schemas.MailAccountCreate):
    encrypted_password = utils.encrypt_password(mail_account.password)

    db_account = models.MailAccount(
        user_id=user_id,
        mail_email=mail_account.mail_email,
        imap_server=mail_account.imap_server,
        smtp_server=mail_account.smtp_server,
        password=encrypted_password,
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)

    threading.Thread(target=sync_new_emails_background, args=(db_account.id,)).start()

    return db_account


def sync_new_emails_background(mail_account_id: int):
    db = SessionLocal()
    try:
        account = db.query(models.MailAccount).get(mail_account_id)
        if account:
            get_or_fetch_folders(db, account)

    finally:
        db.close()



def get_mail_accounts_for_user(db: Session, user_id: int):
    return db.query(models.MailAccount).filter(models.MailAccount.user_id == user_id).all()