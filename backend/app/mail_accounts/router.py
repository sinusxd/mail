from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from . import service, schemas

router = APIRouter(prefix="/mail-accounts", tags=["mail-accounts"])

@router.post("", response_model=schemas.MailAccountInDB)
def create_mail_account(
    mail_account: schemas.MailAccountCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return service.create_mail_account(db, user_id=current_user.id, mail_account=mail_account)

@router.get("", response_model=List[schemas.MailAccountInDB])
def get_my_mail_accounts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    accounts = service.get_mail_accounts_for_user(db, user_id=current_user.id)
    return accounts