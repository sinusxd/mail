from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db
from mail_accounts.models import MailAccount
from sync.service import sync_new_emails

router = APIRouter(tags=["Sync"])


@router.post("/mails/sync")
def sync_emails(
    mail_account_id: int = Query(..., description="ID почтового аккаунта"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    account: MailAccount | None = db.query(MailAccount).filter(
        MailAccount.id == mail_account_id,
        MailAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Почтовый аккаунт не найден")

    sync_new_emails(db, account)
    return {"status": "ok"}
