import secrets
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import UserCreate, UserResponse, Token, PasswordChange, ProfileUpdate
from app.utils import get_password_hash, verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_api_key(self, api_key: str) -> User | None:
        """Get a user by API key."""
        result = await self.db.execute(select(User).where(User.api_key == api_key))
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserCreate) -> Token:
        """Create a new user and return a token."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Create new user
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Generate token
        access_token = create_access_token(user.id)
        return Token(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def authenticate_user(self, email: str, password: str) -> Token:
        """Authenticate a user and return a token."""
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")

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
        if data.email and data.email != user.email:
            # Check if email is already taken
            existing = await self.get_user_by_email(data.email)
            if existing:
                raise ValueError("Email already in use")
            user.email = data.email

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
