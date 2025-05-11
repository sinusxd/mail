from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import service, schemas, utils
from database import get_db
from .dependencies import get_current_user
from .schemas import UserInDB

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=schemas.UserInDB)
def signup(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = service.get_user_by_username(db, user_create.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return service.create_user(db, user_create)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = utils.create_access_token(data={"sub": user.username})
    return schemas.Token(access_token=access_token)

@router.get("/me", response_model=UserInDB)
def read_users_me(current_user = Depends(get_current_user)):
    return current_user