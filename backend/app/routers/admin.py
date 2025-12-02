from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    UserListResponse,
    AdminUserCreate,
    AdminUserUpdate,
    PaginatedUsersResponse,
    MessageResponse,
)
from app.services.admin_service import AdminService
from app.routers.deps import get_current_user, get_current_admin_user
from app.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=PaginatedUsersResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=500),  # Allow up to 500 for admin frontend filtering
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of users. Admin only."""
    service = AdminService(db)
    return await service.get_users(
        page=page,
        per_page=per_page,
        search=search,
        role=role,
        is_active=is_active,
    )


@router.post("/users", response_model=UserListResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: AdminUserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user. Admin only."""
    service = AdminService(db)
    try:
        return await service.create_user(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/users/{user_id}", response_model=UserListResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific user. Admin only."""
    service = AdminService(db)
    user = await service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    from sqlalchemy import select, func
    from app.models import URL
    url_count_result = await db.execute(
        select(func.count(URL.id)).where(URL.user_id == user.id)
    )
    url_count = url_count_result.scalar() or 0
    
    return UserListResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at,
        is_verified=user.is_verified,
        oauth_provider=user.oauth_provider,
        avatar_url=user.avatar_url,
        role=user.role,
        is_active=user.is_active,
        url_count=url_count,
    )


@router.put("/users/{user_id}", response_model=UserListResponse)
async def update_user(
    user_id: UUID,
    data: AdminUserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's details. Admin only."""
    service = AdminService(db)
    try:
        return await service.update_user(user_id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user. Admin only."""
    service = AdminService(db)
    try:
        await service.delete_user(user_id, current_user.id)
        return {"message": "User deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/users/{user_id}/toggle-status", response_model=UserListResponse)
async def toggle_user_status(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle a user's active status. Admin only."""
    service = AdminService(db)
    try:
        return await service.toggle_user_status(user_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard statistics. Admin only."""
    service = AdminService(db)
    return await service.get_dashboard_stats()


@router.get("/cleanup/stats")
async def get_cleanup_stats(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get statistics about data that can be cleaned up. Admin only."""
    service = AdminService(db)
    return await service.get_cleanup_stats()


@router.post("/cleanup/expired-links")
async def cleanup_expired_links(
    dry_run: bool = Query(True, description="If true, only count without deleting"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete expired links and their analytics. Admin only."""
    service = AdminService(db)
    return await service.cleanup_expired_links(dry_run=dry_run)


@router.post("/cleanup/unverified-users")
async def cleanup_unverified_users(
    days_old: int = Query(7, ge=1, description="Delete users unverified for more than X days"),
    dry_run: bool = Query(True, description="If true, only count without deleting"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete unverified users older than specified days. Admin only."""
    service = AdminService(db)
    return await service.cleanup_unverified_users(days_old=days_old, dry_run=dry_run)


@router.post("/cleanup/zero-click-links")
async def cleanup_zero_click_links(
    days_old: int = Query(90, ge=1, description="Delete links with 0 clicks older than X days"),
    dry_run: bool = Query(True, description="If true, only count without deleting"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete links with zero clicks older than specified days. Admin only."""
    service = AdminService(db)
    return await service.cleanup_zero_click_links(days_old=days_old, dry_run=dry_run)


@router.post("/cleanup/old-analytics")
async def cleanup_old_analytics(
    days_old: int = Query(365, ge=1, description="Delete analytics older than X days"),
    dry_run: bool = Query(True, description="If true, only count without deleting"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete analytics records older than specified days. Admin only."""
    service = AdminService(db)
    return await service.cleanup_old_analytics(days_old=days_old, dry_run=dry_run)


@router.post("/cleanup/inactive-users")
async def cleanup_inactive_users(
    days_old: int = Query(30, ge=1, description="Delete users with no links older than X days"),
    dry_run: bool = Query(True, description="If true, only count without deleting"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete users with no links who haven't been active. Admin only."""
    service = AdminService(db)
    return await service.cleanup_inactive_users(days_old=days_old, dry_run=dry_run)
