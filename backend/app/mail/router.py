from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Any

import imap.service
from auth.dependencies import get_current_user
from database import get_db
from mail_accounts.models import MailAccount
from . import service
from .schemas import EmailInfo, FolderInfo
from .exceptions import MailServiceException
from .service import get_or_fetch_emails_from_folder

router = APIRouter(prefix="/mails", tags=["mail"])


@router.get("", response_model=dict[str, Any])
def get_paginated_emails(
        mail_account_id: int = Query(..., description="ID почтового аккаунта"),
        folder_name: str = Query("INBOX", description="Название папки (по умолчанию INBOX)"),
        offset: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == mail_account_id,
        MailAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    emails = service.get_or_fetch_emails_from_folder(db, account, folder_name, offset, limit)

    return {
        "emails": emails,
        "email_count": account.email_count,
    }


@router.get("/count")
def fetch_emails_count(
        mail_account_id: int = Query(..., description="ID аккаунта почты"),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    mail_account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == mail_account_id,
        MailAccount.user_id == current_user.id
    ).first()

    if not mail_account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    try:
        return {"count": imap.service.get_mail_count(mail_account)}
    except MailServiceException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-uid", response_model=EmailInfo)
def get_email_by_uid(
        account_id: int = Query(..., description="ID почтового аккаунта"),
        uid: str = Query(..., description="UID письма"),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    return service.get_email_by_uid(db, account_id, current_user.id, uid)


@router.get("/folders", response_model=List[FolderInfo])
def get_folders(
        mail_account_id: int = Query(..., alias="mail_account_id"),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == mail_account_id,
        MailAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    return service.get_or_fetch_folders(db, account)


@router.get("/by-folder", response_model=List[EmailInfo])
def get_emails_by_folder(
        mail_account_id: int = Query(..., description="ID почтового аккаунта"),
        folder_name: str = Query(..., description="Название папки IMAP (например, INBOX, Sent и т.д.)"),
        offset: int = Query(0, ge=0),
        limit: int = Query(20, gt=0),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == mail_account_id,
        MailAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    try:
        return get_or_fetch_emails_from_folder(db, account, folder_name, offset, limit)
    except MailServiceException as e:
        raise HTTPException(status_code=500, detail=str(e))
