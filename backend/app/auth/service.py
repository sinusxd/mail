from sqlalchemy.orm import Session
from . import models, schemas, utils

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not utils.verify_password(password, user.password_hash):
        return False
    return user

def create_user(db: Session, user_create: schemas.UserCreate):
    hashed_password = utils.get_password_hash(user_create.password)
    user = models.User(username=user_create.username, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
