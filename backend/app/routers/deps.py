from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils import verify_token
from app.services import AuthService
from app.models import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the current authenticated user from JWT token (cookie or header)."""
    token = None
    
    # First check HTTP-only cookie
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header (for API key usage)
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # First try JWT token
    token_data = verify_token(token)
    if token_data:
        service = AuthService(db)
        user = await service.get_user_by_id(token_data.sub)
        if user:
            return user
    
    # Then try API key
    service = AuthService(db)
    user = await service.get_user_by_api_key(token)
    if user:
        return user
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Get the current user if authenticated, otherwise None."""
    try:
        return await get_current_user(request, credentials, db)
    except HTTPException:
        return None
