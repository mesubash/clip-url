import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    # Feedback content
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'suggestion', 'complaint', 'bug', 'other'
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # User info (optional - can be anonymous)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)  # For non-logged in users
    
    # Status tracking
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # 'pending', 'reviewed', 'resolved', 'dismissed'
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", backref="feedback")
