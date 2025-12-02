import secrets
import asyncio
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import UserCreate, UserResponse, Token, PasswordChange, ProfileUpdate
from app.utils import get_password_hash, verify_password, create_access_token
from app.services.email_service import (
    is_disposable_email,
    generate_token,
    get_token_expiry,
    send_verification_email,
    send_password_reset_email,
    send_welcome_email,
)
from app.services.oauth_service import GoogleUserInfo


def _fire_and_forget(coro):
    """Run a coroutine in the background without blocking."""
    asyncio.create_task(coro)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: UUID | str) -> User | None:
        """Get a user by ID."""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_api_key(self, api_key: str) -> User | None:
        """Get a user by API key."""
        result = await self.db.execute(select(User).where(User.api_key == api_key))
        return result.scalar_one_or_none()

    async def get_user_by_verification_token(self, token: str) -> User | None:
        """Get a user by verification token."""
        result = await self.db.execute(
            select(User).where(User.verification_token == token)
        )
        return result.scalar_one_or_none()

    async def get_user_by_reset_token(self, token: str) -> User | None:
        """Get a user by password reset token."""
        result = await self.db.execute(
            select(User).where(User.reset_token == token)
        )
        return result.scalar_one_or_none()

    async def get_user_by_oauth(self, provider: str, oauth_id: str) -> User | None:
        """Get a user by OAuth provider and ID."""
        result = await self.db.execute(
            select(User).where(
                User.oauth_provider == provider,
                User.oauth_id == oauth_id
            )
        )
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserCreate, send_verification: bool = True) -> Token:
        """Create a new user and return a token."""
        email = user_data.email.lower()
        
        # Check for disposable email
        if is_disposable_email(email):
            raise ValueError("Temporary/disposable email addresses are not allowed")
        
        # Check if user already exists
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")

        # Generate verification token
        verification_token = generate_token()
        
        # Create new user
        user = User(
            email=email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
            is_verified=False,
            verification_token=verification_token,
            verification_token_expires=get_token_expiry(hours=24),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Send verification email in background (don't block response)
        if send_verification:
            _fire_and_forget(send_verification_email(user.email, user.name, verification_token))

        # Generate token
        access_token = create_access_token(user.id)
        return Token(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def authenticate_user(self, email: str, password: str) -> Token:
        """Authenticate a user and return a token."""
        user = await self.get_user_by_email(email.lower())
        
        if not user:
            raise ValueError("Invalid email or password")
        
        # Check if user has a password (not OAuth-only)
        if not user.password_hash:
            raise ValueError("Please use Google to sign in to this account")
        
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(user.id)
        return Token(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def verify_email(self, token: str) -> UserResponse:
        """Verify user's email address."""
        user = await self.get_user_by_verification_token(token)
        
        if not user:
            raise ValueError("Invalid verification token")
        
        if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
            raise ValueError("Verification token has expired")
        
        if user.is_verified:
            raise ValueError("Email already verified")
        
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        await self.db.commit()
        await self.db.refresh(user)
        
        # Send welcome email in background
        _fire_and_forget(send_welcome_email(user.email, user.name))
        
        return UserResponse.model_validate(user)

    async def resend_verification_email(self, email: str) -> bool:
        """Resend verification email."""
        user = await self.get_user_by_email(email.lower())
        
        if not user:
            # Don't reveal if email exists
            return True
        
        if user.is_verified:
            raise ValueError("Email already verified")
        
        # Generate new token
        user.verification_token = generate_token()
        user.verification_token_expires = get_token_expiry(hours=24)
        await self.db.commit()
        
        # Send in background
        _fire_and_forget(send_verification_email(user.email, user.name, user.verification_token))
        return True

    async def request_password_reset(self, email: str) -> bool:
        """Request password reset - sends email if user exists."""
        user = await self.get_user_by_email(email.lower())
        
        if not user:
            # Don't reveal if email exists
            return True
        
        # Check if user is OAuth-only
        if not user.password_hash and user.oauth_provider:
            # Don't reveal, but also don't send email
            return True
        
        # Generate reset token
        user.reset_token = generate_token()
        user.reset_token_expires = get_token_expiry(hours=1)
        await self.db.commit()
        
        # Send in background
        _fire_and_forget(send_password_reset_email(user.email, user.name, user.reset_token))
        return True

    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token."""
        user = await self.get_user_by_reset_token(token)
        
        if not user:
            raise ValueError("Invalid reset token")
        
        if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
            raise ValueError("Reset token has expired")
        
        user.password_hash = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        await self.db.commit()
        
        return True

    async def authenticate_google_user(self, google_user: GoogleUserInfo) -> Token:
        """Authenticate or create user via Google OAuth."""
        email = google_user.email.lower()
        
        # Check for disposable email
        if is_disposable_email(email):
            raise ValueError("Temporary/disposable email addresses are not allowed")
        
        # First check if user exists with this Google ID
        user = await self.get_user_by_oauth("google", google_user.id)
        
        if user:
            # Update avatar if changed
            if google_user.picture and user.avatar_url != google_user.picture:
                user.avatar_url = google_user.picture
                await self.db.commit()
                await self.db.refresh(user)
        else:
            # Check if user exists with this email
            user = await self.get_user_by_email(email)
            
            if user:
                # Link Google to existing account
                user.oauth_provider = "google"
                user.oauth_id = google_user.id
                user.avatar_url = google_user.picture
                # Mark as verified since Google verified the email
                user.is_verified = True
                user.verification_token = None
                user.verification_token_expires = None
                await self.db.commit()
                await self.db.refresh(user)
            else:
                # Create new user
                user = User(
                    email=email,
                    name=google_user.name,
                    password_hash=None,  # No password for OAuth users
                    is_verified=True,  # Google verified
                    oauth_provider="google",
                    oauth_id=google_user.id,
                    avatar_url=google_user.picture,
                )
                self.db.add(user)
                await self.db.commit()
                await self.db.refresh(user)
                
                # Send welcome email in background for new users
                _fire_and_forget(send_welcome_email(user.email, user.name))
        
        access_token = create_access_token(user.id)
        return Token(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def change_password(self, user_id: UUID, data: PasswordChange) -> bool:
        """Change user password."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Check if user has a password (not OAuth-only)
        if not user.password_hash:
            raise ValueError("Cannot change password for Google sign-in accounts. Set a password first.")

        if not verify_password(data.current_password, user.password_hash):
            raise ValueError("Current password is incorrect")

        user.password_hash = get_password_hash(data.new_password)
        await self.db.commit()
        return True

    async def update_profile(self, user_id: UUID, data: ProfileUpdate) -> UserResponse:
        """Update user profile."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if data.name:
            user.name = data.name
        if data.email and data.email.lower() != user.email:
            new_email = data.email.lower()
            
            # Check for disposable email
            if is_disposable_email(new_email):
                raise ValueError("Temporary/disposable email addresses are not allowed")
            
            # Check if email is already taken
            existing = await self.get_user_by_email(new_email)
            if existing:
                raise ValueError("Email already in use")
            user.email = new_email
            # Require re-verification for new email
            user.is_verified = False
            user.verification_token = generate_token()
            user.verification_token_expires = get_token_expiry(hours=24)
            # Send in background
            _fire_and_forget(send_verification_email(user.email, user.name, user.verification_token))

        await self.db.commit()
        await self.db.refresh(user)
        return UserResponse.model_validate(user)

    async def generate_api_key(self, user_id: UUID) -> str:
        """Generate a new API key for the user."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Generate a secure API key
        api_key = f"sk_live_{secrets.token_urlsafe(24)}"
        user.api_key = api_key
        await self.db.commit()
        return api_key

    async def revoke_api_key(self, user_id: UUID) -> bool:
        """Revoke user's API key."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        user.api_key = None
        await self.db.commit()
        return True
