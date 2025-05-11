from pydantic import BaseModel


class MailAccountCreate(BaseModel):
    mail_email: str
    imap_server: str
    smtp_server: str
    password: str


class MailAccountInDB(BaseModel):
    mail_email: str
    imap_server: str
    smtp_server: str
    id: int
    user_id: int
    email_count: int
    last_synced_uid: int

    class Config:
        from_attributes = True
