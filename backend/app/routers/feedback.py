from datetime import datetime, timezone
from uuid import UUID
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case

from app.database import get_db
from app.models import Feedback, User
from app.schemas import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackAdminResponse,
    FeedbackUpdate,
    FeedbackStats,
    PaginatedFeedbackResponse,
    MessageResponse,
)
from app.routers.deps import get_optional_user, get_current_user, get_current_admin_user as get_current_admin

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """
    Submit feedback. Can be submitted by logged-in users or anonymously with email.
    """
    # For anonymous users, email is required
    if not current_user and not data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required for anonymous feedback",
        )

    feedback = Feedback(
        type=data.type,
        subject=data.subject,
        message=data.message,
        user_id=current_user.id if current_user else None,
        email=data.email if not current_user else current_user.email,
        status="pending",
    )

    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    return feedback


@router.get("/my", response_model=list[FeedbackResponse])
async def get_my_feedback(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get feedback submitted by the current user."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    result = await db.execute(
        select(Feedback)
        .where(Feedback.user_id == current_user.id)
        .order_by(Feedback.created_at.desc())
    )
    return result.scalars().all()


# ==================
# Admin Endpoints
# ==================

@router.get("/admin/stats", response_model=FeedbackStats)
async def get_feedback_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get feedback statistics (admin only)."""
    # Get counts by status
    status_result = await db.execute(
        select(
            func.count(Feedback.id).label("total"),
            func.sum(case((Feedback.status == "pending", 1), else_=0)).label("pending"),
            func.sum(case((Feedback.status == "reviewed", 1), else_=0)).label("reviewed"),
            func.sum(case((Feedback.status == "resolved", 1), else_=0)).label("resolved"),
            func.sum(case((Feedback.status == "dismissed", 1), else_=0)).label("dismissed"),
        )
    )
    stats = status_result.one()

    # Get counts by type
    type_result = await db.execute(
        select(Feedback.type, func.count(Feedback.id))
        .group_by(Feedback.type)
    )
    by_type = {row[0]: row[1] for row in type_result.all()}

    return FeedbackStats(
        total=stats.total or 0,
        pending=stats.pending or 0,
        reviewed=stats.reviewed or 0,
        resolved=stats.resolved or 0,
        dismissed=stats.dismissed or 0,
        by_type=by_type,
    )


@router.get("/admin", response_model=PaginatedFeedbackResponse)
async def get_all_feedback(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, pattern=r"^(pending|reviewed|resolved|dismissed)$"),
    type_filter: str | None = Query(None, pattern=r"^(suggestion|complaint|bug|other)$"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get all feedback with pagination (admin only)."""
    # Build query
    query = select(Feedback)

    if status_filter:
        query = query.where(Feedback.status == status_filter)
    if type_filter:
        query = query.where(Feedback.type == type_filter)

    # Get total count
    count_query = select(func.count(Feedback.id))
    if status_filter:
        count_query = count_query.where(Feedback.status == status_filter)
    if type_filter:
        count_query = count_query.where(Feedback.type == type_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated results
    query = query.order_by(Feedback.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    feedback_list = result.scalars().all()

    # Enrich with user info
    items = []
    for fb in feedback_list:
        user_name = None
        user_email = fb.email

        if fb.user_id:
            user_result = await db.execute(
                select(User.name, User.email).where(User.id == fb.user_id)
            )
            user_data = user_result.first()
            if user_data:
                user_name = user_data.name
                user_email = user_data.email

        items.append(FeedbackAdminResponse(
            id=fb.id,
            type=fb.type,
            subject=fb.subject,
            message=fb.message,
            email=fb.email,
            user_id=fb.user_id,
            status=fb.status,
            admin_notes=fb.admin_notes,
            created_at=fb.created_at,
            reviewed_at=fb.reviewed_at,
            user_name=user_name,
            user_email=user_email,
        ))

    return PaginatedFeedbackResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=ceil(total / per_page) if total > 0 else 1,
    )


@router.get("/admin/{feedback_id}", response_model=FeedbackAdminResponse)
async def get_feedback_detail(
    feedback_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get feedback details (admin only)."""
    result = await db.execute(
        select(Feedback).where(Feedback.id == feedback_id)
    )
    feedback = result.scalar_one_or_none()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    # Get user info if available
    user_name = None
    user_email = feedback.email

    if feedback.user_id:
        user_result = await db.execute(
            select(User.name, User.email).where(User.id == feedback.user_id)
        )
        user_data = user_result.first()
        if user_data:
            user_name = user_data.name
            user_email = user_data.email

    return FeedbackAdminResponse(
        id=feedback.id,
        type=feedback.type,
        subject=feedback.subject,
        message=feedback.message,
        email=feedback.email,
        user_id=feedback.user_id,
        status=feedback.status,
        admin_notes=feedback.admin_notes,
        created_at=feedback.created_at,
        reviewed_at=feedback.reviewed_at,
        user_name=user_name,
        user_email=user_email,
    )


@router.patch("/admin/{feedback_id}", response_model=FeedbackAdminResponse)
async def update_feedback(
    feedback_id: UUID,
    data: FeedbackUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Update feedback status and notes (admin only)."""
    result = await db.execute(
        select(Feedback).where(Feedback.id == feedback_id)
    )
    feedback = result.scalar_one_or_none()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    if data.status:
        feedback.status = data.status
        if data.status != "pending":
            feedback.reviewed_at = datetime.now(timezone.utc)

    if data.admin_notes is not None:
        feedback.admin_notes = data.admin_notes

    await db.commit()
    await db.refresh(feedback)

    # Get user info
    user_name = None
    user_email = feedback.email

    if feedback.user_id:
        user_result = await db.execute(
            select(User.name, User.email).where(User.id == feedback.user_id)
        )
        user_data = user_result.first()
        if user_data:
            user_name = user_data.name
            user_email = user_data.email

    return FeedbackAdminResponse(
        id=feedback.id,
        type=feedback.type,
        subject=feedback.subject,
        message=feedback.message,
        email=feedback.email,
        user_id=feedback.user_id,
        status=feedback.status,
        admin_notes=feedback.admin_notes,
        created_at=feedback.created_at,
        reviewed_at=feedback.reviewed_at,
        user_name=user_name,
        user_email=user_email,
    )


@router.delete("/admin/{feedback_id}", response_model=MessageResponse)
async def delete_feedback(
    feedback_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Delete feedback (admin only)."""
    result = await db.execute(
        select(Feedback).where(Feedback.id == feedback_id)
    )
    feedback = result.scalar_one_or_none()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    await db.delete(feedback)
    await db.commit()

    return {"message": "Feedback deleted successfully"}
