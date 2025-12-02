from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class FeedbackCreate(BaseModel):
    """Schema for creating feedback."""
    type: str = Field(..., pattern=r"^(suggestion|complaint|bug|other)$")
    subject: str = Field(..., min_length=5, max_length=255)
    message: str = Field(..., min_length=10, max_length=5000)
    email: EmailStr | None = None  # Optional email for non-logged in users


class FeedbackResponse(BaseModel):
    """Schema for feedback response."""
    id: UUID
    type: str
    subject: str
    message: str
    email: str | None
    user_id: UUID | None
    status: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class FeedbackAdminResponse(FeedbackResponse):
    """Schema for admin feedback response with extra details."""
    admin_notes: str | None
    reviewed_at: datetime | None
    user_name: str | None = None
    user_email: str | None = None


class FeedbackUpdate(BaseModel):
    """Schema for updating feedback (admin only)."""
    status: str | None = Field(None, pattern=r"^(pending|reviewed|resolved|dismissed)$")
    admin_notes: str | None = Field(None, max_length=2000)


class FeedbackStats(BaseModel):
    """Schema for feedback statistics."""
    total: int
    pending: int
    reviewed: int
    resolved: int
    dismissed: int
    by_type: dict[str, int]


class PaginatedFeedbackResponse(BaseModel):
    """Paginated feedback response for admin."""
    items: list[FeedbackAdminResponse]
    total: int
    page: int
    per_page: int
    pages: int
