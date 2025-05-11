import re
import time
from typing import List

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

import imap.service
from mail.exceptions import MailServiceException
from mail.models import Email, Folder
from mail.schemas import EmailInfo, FolderInfo
from mail_accounts.models import MailAccount
from imap.service import fetch_email_by_uid, connect_imap, fetch_folders, fetch_emails_from_folder
from utils import parse_email_date


def get_email_count(db: Session, account: MailAccount) -> int:
    return db.query(Email).filter(Email.account_id == account.id).count()


def get_email_by_uid(
        db: Session,
        account_id: int,
        user_id: int,
        uid: str
) -> EmailInfo:
    account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == account_id,
        MailAccount.user_id == user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    email = db.query(Email).filter(
        Email.account_id == account.id,
        Email.uid == int(uid)
    ).first()

    if not email:
        mail = connect_imap(account)
        fetched = fetch_email_by_uid(mail, uid)
        mail.logout()

        if not fetched:
            raise HTTPException(status_code=404, detail="Письмо не найдено")

        email = Email(
            account_id=account.id,
            uid=fetched.uid,
            sender_name=fetched.sender_name,
            sender_email=fetched.email_address,
            subject=fetched.subject,
            snippet=fetched.snippet,
            body=fetched.body,
            date=parse_email_date(fetched.date),
        )
        db.add(email)
        db.commit()
        db.refresh(email)

    return EmailInfo.model_validate(email)


def get_or_fetch_folders(db: Session, account: MailAccount) -> List[FolderInfo]:
    folders = db.query(Folder).filter(Folder.account_id == account.id).all()

    if folders:
        return [FolderInfo.model_validate(f) for f in folders]

    try:
        folder_names = fetch_folders(account)

        mail = connect_imap(account)
        try:
            for name in folder_names:
                # Получаем UIDNEXT и COUNT
                uidnext = 0
                count = 0

                status_res, status_data = mail.status(f'"{name}"', "(UIDNEXT MESSAGES)")
                if status_res == "OK" and status_data:
                    decoded = status_data[0].decode()
                    uid_match = re.search(r"UIDNEXT (\d+)", decoded)
                    count_match = re.search(r"MESSAGES (\d+)", decoded)

                    if uid_match:
                        uidnext = int(uid_match.group(1)) - 1
                    if count_match:
                        count = int(count_match.group(1))

                folder = Folder(
                    name=name,
                    account_id=account.id,
                    last_uid=uidnext,
                    email_count=count
                )
                db.add(folder)
        finally:
            mail.logout()

        db.commit()
        return [FolderInfo.model_validate(f) for f in db.query(Folder).filter(Folder.account_id == account.id).all()]
    except MailServiceException as e:
        raise e


def get_or_fetch_emails_from_folder(
        db: Session,
        account: MailAccount,
        folder_name: str = "INBOX",
        offset: int = 0,
        limit: int = 20
) -> List[EmailInfo]:
    start = time.perf_counter()

    # Получаем или создаём папку
    folder = db.query(Folder).filter(
        Folder.account_id == account.id,
        Folder.name == folder_name
    ).first()

    if not folder:
        folder = Folder(name=folder_name, account_id=account.id, last_uid=0)
        db.add(folder)
        db.commit()
        db.refresh(folder)

    # Загружаем письма из БД
    db_query_start = time.perf_counter()
    emails = (
        db.query(Email)
        .filter(
            Email.account_id == account.id,
            Email.folder_id == folder.id
        )
        .order_by(Email.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    print(f"[PERF] DB query took {time.perf_counter() - db_query_start:.3f}s")

    # Если писем достаточно — возвращаем
    total_email_count = db.query(func.count(Email.id)).filter(
        Email.account_id == account.id,
        Email.folder_id == folder.id
    ).scalar()

    if total_email_count >= offset + limit:
        print(f"[PERF] TOTAL took {time.perf_counter() - start:.3f}s (from DB only)")
        return [EmailInfo.model_validate(e) for e in emails]

    # Иначе — запрашиваем новые письма из IMAP
    fetch_start = time.perf_counter()
    fetched_emails = imap.service.fetch_email_headers_from_folder(
        account=account,
        folder_name=folder_name,
        last_uid=folder.last_uid or 0,
        limit=limit,
        offset=offset
    )
    print(f"[PERF] fetch_email_headers_from_folder took {time.perf_counter() - fetch_start:.3f}s")

    # UID'ы уже существующих писем
    existing_uids = {
        uid for (uid,) in db.query(Email.uid)
        .filter(
            Email.account_id == account.id,
            Email.folder_id == folder.id,
            Email.uid.in_([f.uid for f in fetched_emails])
        )
        .all()
    }

    # Сохраняем только новые письма
    max_uid_fetched = 0
    for fetched in fetched_emails:
        if fetched.uid in existing_uids:
            continue
        email = Email(
            account_id=account.id,
            uid=fetched.uid,
            sender_name=fetched.sender_name,
            sender_email=fetched.email_address,
            subject=fetched.subject,
            snippet=fetched.snippet,
            body=fetched.body,
            date=parse_email_date(fetched.date),
            folder_id=folder.id,
        )
        db.add(email)
        max_uid_fetched = max(max_uid_fetched, fetched.uid)

    if max_uid_fetched > (folder.last_uid or 0):
        folder.last_uid = max_uid_fetched
        db.add(folder)

    db.commit()
    print(f"[PERF] DB commit + folder.last_uid update took {time.perf_counter() - fetch_start:.3f}s")

    # Повторный запрос после вставки новых писем
    reload_start = time.perf_counter()
    final_emails = (
        db.query(Email)
        .filter(
            Email.account_id == account.id,
            Email.folder_id == folder.id
        )
        .order_by(Email.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    print(f"[PERF] Final DB fetch took {time.perf_counter() - reload_start:.3f}s")
    print(f"[PERF] TOTAL get_or_fetch_emails_from_folder took {time.perf_counter() - start:.3f}s")

    return [EmailInfo.model_validate(e) for e in final_emails]
