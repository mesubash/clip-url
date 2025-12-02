from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    PasswordChange,
    ProfileUpdate,
)
from app.services import AuthService
from app.routers.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

# Cookie settings
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = settings.access_token_expire_minutes * 60  # Convert to seconds


def set_auth_cookie(response: Response, token: str):
    """Set HTTP-only secure cookie with the access token."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=not settings.debug,  # Secure only in production (HTTPS)
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    service = AuthService(db)
    try:
        token_data = await service.create_user(user_data)
        set_auth_cookie(response, token_data.access_token)
        return token_data.user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=UserResponse)
async def login(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and set auth cookie."""
    service = AuthService(db)
    try:
        token_data = await service.authenticate_user(credentials.email, credentials.password)
        set_auth_cookie(response, token_data.access_token)
        return token_data.user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie and log out."""
    clear_auth_cookie(response)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile."""
    service = AuthService(db)
    try:
        return await service.update_profile(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password."""
    service = AuthService(db)
    try:
        await service.change_password(current_user.id, data)
        return {"message": "Password updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/api-key")
async def generate_api_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a new API key."""
    service = AuthService(db)
    api_key = await service.generate_api_key(current_user.id)
    return {"api_key": api_key}


@router.delete("/api-key")
async def revoke_api_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke user's API key."""
    service = AuthService(db)
    await service.revoke_api_key(current_user.id)
    return {"message": "API key revoked"}
