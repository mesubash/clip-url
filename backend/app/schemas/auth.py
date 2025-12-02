from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime
    api_key: str | None = None
    is_verified: bool = False
    oauth_provider: str | None = None
    avatar_url: str | None = None
    role: str = "user"
    is_active: bool = True

    class Config:
        from_attributes = True


# Admin schemas
class UserListResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime
    is_verified: bool
    oauth_provider: str | None = None
    avatar_url: str | None = None
    role: str
    is_active: bool
    url_count: int = 0

    class Config:
        from_attributes = True


class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "user"
    is_verified: bool = False


class AdminUserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class PaginatedUsersResponse(BaseModel):
    users: list[UserListResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str
    exp: datetime


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None


# Email verification
class ResendVerificationRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str


# Password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


# Google OAuth
class GoogleAuthRequest(BaseModel):
    """For frontend SDK flow - receives ID token directly."""
    credential: str  # Google ID token from frontend


class GoogleAuthCallbackRequest(BaseModel):
    """For server-side OAuth flow - receives authorization code."""
    code: str
    redirect_uri: str


class MessageResponse(BaseModel):
    message: str
