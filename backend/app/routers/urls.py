from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    URLCreate,
    URLUpdate,
    URLResponse,
    URLListResponse,
    AnalyticsResponse,
)
from app.services import URLService, AnalyticsService
from app.routers.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/urls", tags=["URLs"])


@router.post("", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
async def create_url(
    data: URLCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new shortened URL."""
    service = URLService(db)
    try:
        return await service.create_url(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=URLListResponse)
async def get_urls(
    search: str | None = Query(None, description="Search in URL or alias"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all URLs for the current user."""
    service = URLService(db)
    return await service.get_user_urls(current_user.id, search)


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get overall URL stats for the current user."""
    service = URLService(db)
    return await service.get_stats(current_user.id)


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated analytics for all user URLs."""
    service = AnalyticsService(db)
    return await service.get_user_analytics(current_user.id)


@router.get("/{url_id}", response_model=URLResponse)
async def get_url(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific URL."""
    service = URLService(db)
    url = await service.get_url_by_id(url_id, current_user.id)
    if not url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")
    return URLResponse(
        id=url.id,
        slug=url.slug,
        original_url=url.original_url,
        short_url=f"{service._build_short_url(url.slug)}",
        click_count=url.click_count,
        created_at=url.created_at,
        expires_at=url.expires_at,
    )


@router.get("/{url_id}/analytics", response_model=AnalyticsResponse)
async def get_url_analytics(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for a specific URL."""
    service = AnalyticsService(db)
    try:
        return await service.get_url_analytics(url_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{url_id}", response_model=URLResponse)
async def update_url(
    url_id: int,
    data: URLUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a URL."""
    service = URLService(db)
    try:
        return await service.update_url(url_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{url_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_url(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a URL."""
    service = URLService(db)
    try:
        await service.delete_url(url_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
