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

    # Если письмо есть, но body пустой — догружаем тело через IMAP
    if email and not email.body:
        fetched = imap.service.fetch_email_by_uid_with_imap_tools(
            account=account,
            folder_name="INBOX",  # или account.default_folder, если у тебя такое поле есть
            uid=int(uid)
        )

        if not fetched:
            raise HTTPException(status_code=404, detail="Письмо не найдено на сервере")

        email.body = fetched.body
        email.snippet = fetched.snippet
        db.add(email)
        db.commit()
        db.refresh(email)

    # Если письма вообще нет в БД — загружаем полностью
    if not email:
        fetched = imap.service.fetch_email_by_uid_with_imap_tools(
            account=account,
            folder_name="INBOX",  # см. выше
            uid=int(uid)
        )

        if not fetched:
            raise HTTPException(status_code=404, detail="Письмо не найдено на сервере")

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


from imap.service import fetch_folder_statuses


def get_or_fetch_folders(db: Session, account: MailAccount) -> List[FolderInfo]:
    # Если папки уже есть в БД — возвращаем их
    folders = db.query(Folder).filter(Folder.account_id == account.id).all()
    if folders:
        return [FolderInfo.model_validate(f) for f in folders]

    try:
        folders_data = fetch_folder_statuses(account)

        for f in folders_data:
            folder = Folder(
                name=f["name"],
                account_id=account.id,
                last_uid=f["uidnext"],
                email_count=f["email_count"]
            )
            db.add(folder)

        db.commit()
        return [
            FolderInfo.model_validate(f)
            for f in db.query(Folder).filter(Folder.account_id == account.id).all()
        ]
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

    # Получаем или создаем папку
    folder = db.query(Folder).filter(
        Folder.account_id == account.id,
        Folder.name == folder_name
    ).first()

    if not folder:
        folder = Folder(name=folder_name, account_id=account.id, last_uid=0, email_count=0)
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

    # Кол-во писем в БД для этой папки
    total_email_count = db.query(func.count(Email.id)).filter(
        Email.account_id == account.id,
        Email.folder_id == folder.id
    ).scalar()

    # 1. Если знаем точное количество писем в папке и все уже в БД — не идем в IMAP
    if folder.email_count and total_email_count >= folder.email_count:
        print(f"[PERF] TOTAL took {time.perf_counter() - start:.3f}s (from DB, known email_count)")
        return [EmailInfo.model_validate(e) for e in emails]

    # 2. Если в БД уже достаточно писем для текущей страницы — не идем в IMAP
    if total_email_count >= offset + limit:
        print(f"[PERF] TOTAL took {time.perf_counter() - start:.3f}s (from DB only)")
        return [EmailInfo.model_validate(e) for e in emails]

    # 3. Иначе — запрашиваем из IMAP
    fetch_start = time.perf_counter()
    fetched_emails = imap.service.fetch_email_headers_from_folder(
        account=account,
        folder_name=folder_name,
        last_uid=folder.last_uid or 0,
        limit=limit,
        offset=offset
    )
    print(f"[PERF] fetch_email_headers_from_folder took {time.perf_counter() - fetch_start:.3f}s")

    # UID'ы писем, которые уже есть в БД
    existing_uids = {
        uid for (uid,) in db.query(Email.uid)
        .filter(
            Email.account_id == account.id,
            Email.folder_id == folder.id,
            Email.uid.in_([f.uid for f in fetched_emails])
        )
        .all()
    }

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

    # Обновляем last_uid и (опционально) email_count
    if max_uid_fetched > (folder.last_uid or 0):
        folder.last_uid = max_uid_fetched
        # можно обновлять и folder.email_count, если хочешь быть точным
        db.add(folder)

    db.commit()
    print(f"[PERF] DB commit + folder.last_uid update took {time.perf_counter() - fetch_start:.3f}s")

    # Повторный запрос для возврата актуальных данных
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
