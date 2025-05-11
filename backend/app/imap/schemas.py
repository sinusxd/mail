from typing import Optional

from pydantic import BaseModel, EmailStr

class MailAccount(BaseModel):
    server: str
    email: EmailStr
    password: str
    mailbox: str = "INBOX"
    offset: int = 0
    limit: int = 10


class EmailInfo(BaseModel):
    subject: str
    sender_name: str
    email_address: str
    date: str
    body: str
    snippet: str
    uid: Optional[int] = None
