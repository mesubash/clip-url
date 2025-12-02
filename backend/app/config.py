from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "ClipURL API"
    debug: bool = True  # Set to False in production
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/clipurl"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    
    # CORS
    frontend_url: str = "http://localhost:8080"
    
    # Short URL
    base_url: str = "http://localhost:8000"
    
    # Email (Resend)
    resend_api_key: Optional[str] = None
    email_from: str = "noreply@clipurl.com.np"
    email_from_name: str = "ClipURL"
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    class Config:
        # Load from root .env file (one level up from backend/)
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields like VITE_* variables


@lru_cache()
def get_settings() -> Settings:
    return Settings()
