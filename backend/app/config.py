from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENCRYPTION_KEY: str = "DH3szdI2UVk5zZhQ6E7yxTpaK0hLlfI1DMvW-pIlpAE="

settings = Settings()
