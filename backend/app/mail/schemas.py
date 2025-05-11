from pydantic import BaseModel
from typing import Optional
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
