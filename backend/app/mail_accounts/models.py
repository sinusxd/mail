from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from database import Base

class MailAccount(Base):
    __tablename__ = "mail_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mail_email = Column(String, nullable=False)
    imap_server = Column(String, nullable=False)
    smtp_server = Column(String, nullable=False)
    password = Column(String, nullable=False)

    emails = relationship("Email", back_populates="account", cascade="all, delete", passive_deletes=True)
    folders = relationship("Folder", back_populates="account", cascade="all, delete", passive_deletes=True)

    email_count = Column(Integer, default=0)
    last_synced_uid = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
