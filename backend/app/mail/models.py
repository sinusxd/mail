from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("mail_accounts.id", ondelete="CASCADE"))
    folder_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)

    uid = Column(Integer, index=True, nullable=False)
    sender_name = Column(String)
    sender_email = Column(String)
    subject = Column(String)
    snippet = Column(String)
    body = Column(Text)
    date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    folder = relationship("Folder", back_populates="emails", passive_deletes=True)
    account = relationship("MailAccount", back_populates="emails", passive_deletes=True)



class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    account_id = Column(Integer, ForeignKey("mail_accounts.id", ondelete="CASCADE"), nullable=False)

    account = relationship("MailAccount", back_populates="folders", passive_deletes=True)
    emails = relationship("Email", back_populates="folder", cascade="all, delete", passive_deletes=True)
    last_uid = Column(Integer, default=0)
    email_count = Column(Integer, default=0)
