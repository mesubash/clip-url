import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Nullable for OAuth users
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Email verification
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_token_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Password reset
    reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # OAuth
    oauth_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)  # 'google', etc.
    oauth_id: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Provider's user ID
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # API Key for programmatic access
    api_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    # Relationships
    urls = relationship("URL", back_populates="user", cascade="all, delete-orphan")
