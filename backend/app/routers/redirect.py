from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import URLService, AnalyticsService

router = APIRouter(tags=["Redirect"])


async def log_analytics(
    db: AsyncSession,
    url_id: int,
    ip_address: str | None,
    user_agent: str | None,
    referrer: str | None,
):
    """Background task to log analytics."""
    service = AnalyticsService(db)
    # In production, you'd use a GeoIP service to get country/city
    await service.log_click(
        url_id=url_id,
        ip_address=ip_address,
        user_agent=user_agent,
        country=None,  # Would be populated by GeoIP lookup
        city=None,
        referrer=referrer,
    )


@router.get("/r/{slug}")
async def redirect_to_url(
    slug: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Redirect to the original URL."""
    service = URLService(db)
    url = await service.increment_click(slug)
    
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found or has expired",
        )
    
    # Log analytics in background
    background_tasks.add_task(
        log_analytics,
        db,
        url.id,
        request.client.host if request.client else None,
        request.headers.get("user-agent"),
        request.headers.get("referer"),
    )
    
    # Use 307 to preserve the request method
    return RedirectResponse(url=url.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
