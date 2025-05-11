from datetime import datetime

from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserInDB(BaseModel):
    id: int
    username: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None
