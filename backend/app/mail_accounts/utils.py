from cryptography.fernet import Fernet
from config import settings

fernet = Fernet(settings.ENCRYPTION_KEY)

def encrypt_password(password: str) -> str:
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    return fernet.decrypt(encrypted_password.encode()).decode()
