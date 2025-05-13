from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class EmailInfo(BaseModel):
    id: int
    sender_name: Optional[str]
    sender_email: str
    subject: Optional[str]
    snippet: Optional[str]
    body: Optional[str]
    date: Optional[datetime]
    uid: Optional[int]

    model_config = {
        "from_attributes": True
    }


class FolderBase(BaseModel):
    name: str


class FolderCreate(FolderBase):
    pass


class FolderInfo(FolderBase):
    id: int
    email_count: int | None = None
    last_uid: int | None = None

    class Config:
        from_attributes = True


class EmailSendRequest(BaseModel):
    recipients: List[EmailStr]
    subject: Optional[str] = None
    body: str
    is_html: bool = False
    sender_name: Optional[str] = None
