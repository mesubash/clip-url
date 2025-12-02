from datetime import datetime, timedelta
from jose import jwt, JWTError
from uuid import UUID

from app.config import get_settings
from app.schemas import TokenPayload

settings = get_settings()


def create_access_token(user_id: UUID) -> str:
    """Create a JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> TokenPayload | None:
    """Verify a JWT token and return the payload."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        token_data = TokenPayload(**payload)
        return token_data
    except JWTError:
        return None
