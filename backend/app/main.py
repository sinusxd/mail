from fastapi import FastAPI, APIRouter
from auth.router import router as auth_router
from mail_accounts.router import router as mail_accounts_router
from mail.router import router as mail_router
from sync.router import router as sync_router

app = FastAPI()

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(mail_accounts_router)
api_router.include_router(mail_router)
api_router.include_router(sync_router)
app.include_router(api_router)
