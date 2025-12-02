from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import URL
from app.schemas import URLCreate, URLUpdate, URLResponse, URLListResponse
from app.utils import generate_slug
from app.config import get_settings

settings = get_settings()


class URLService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_short_url(self, slug: str) -> str:
        """Build the full short URL from a slug."""
        return f"{settings.base_url}/r/{slug}"

    def _url_to_response(self, url: URL) -> URLResponse:
        """Convert a URL model to a response schema."""
        return URLResponse(
            id=url.id,
            slug=url.slug,
            original_url=url.original_url,
            short_url=self._build_short_url(url.slug),
            click_count=url.click_count,
            created_at=url.created_at,
            expires_at=url.expires_at,
        )

    async def create_url(self, user_id: UUID, data: URLCreate) -> URLResponse:
        """Create a new shortened URL."""
        # Check if custom alias is already taken
        if data.custom_alias:
            existing = await self.get_url_by_slug(data.custom_alias)
            if existing:
                raise ValueError("This alias is already taken")

        # Create URL with placeholder slug
        url = URL(
            slug="temp",  # Will be updated after we get the ID
            original_url=str(data.original_url),
            user_id=user_id,
            expires_at=data.expires_at,
        )
        self.db.add(url)
        await self.db.flush()  # Get the ID without committing

        # Generate or use custom slug
        if data.custom_alias:
            url.slug = data.custom_alias
        else:
            url.slug = generate_slug(url.id)

        await self.db.commit()
        await self.db.refresh(url)
        return self._url_to_response(url)

    async def get_url_by_slug(self, slug: str) -> URL | None:
        """Get a URL by its slug."""
        result = await self.db.execute(select(URL).where(URL.slug == slug))
        return result.scalar_one_or_none()

    async def get_url_by_id(self, url_id: int, user_id: UUID) -> URL | None:
        """Get a URL by ID for a specific user."""
        result = await self.db.execute(
            select(URL).where(URL.id == url_id, URL.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_user_urls(self, user_id: UUID, search: str | None = None) -> URLListResponse:
        """Get all URLs for a user with optional search."""
        query = select(URL).where(URL.user_id == user_id).order_by(URL.created_at.desc())
        
        if search:
            search_filter = f"%{search.lower()}%"
            query = query.where(
                (URL.original_url.ilike(search_filter)) | 
                (URL.slug.ilike(search_filter))
            )

        result = await self.db.execute(query)
        urls = result.scalars().all()

        # Calculate totals
        total_clicks = sum(url.click_count for url in urls)

        return URLListResponse(
            urls=[self._url_to_response(url) for url in urls],
            total=len(urls),
            total_clicks=total_clicks,
        )

    async def update_url(self, url_id: int, user_id: UUID, data: URLUpdate) -> URLResponse:
        """Update a URL."""
        url = await self.get_url_by_id(url_id, user_id)
        if not url:
            raise ValueError("URL not found")

        if data.alias and data.alias != url.slug:
            # Check if new alias is taken
            existing = await self.get_url_by_slug(data.alias)
            if existing:
                raise ValueError("This alias is already taken")
            url.slug = data.alias

        if data.expires_at is not None:
            url.expires_at = data.expires_at

        await self.db.commit()
        await self.db.refresh(url)
        return self._url_to_response(url)

    async def delete_url(self, url_id: int, user_id: UUID) -> bool:
        """Delete a URL."""
        url = await self.get_url_by_id(url_id, user_id)
        if not url:
            raise ValueError("URL not found")

        await self.db.delete(url)
        await self.db.commit()
        return True

    async def increment_click(self, slug: str) -> URL | None:
        """Increment click count and return the URL for redirect."""
        url = await self.get_url_by_slug(slug)
        if not url:
            return None

        # Check if URL is expired
        if url.expires_at and url.expires_at < datetime.utcnow():
            return None

        url.click_count += 1
        await self.db.commit()
        return url

    async def get_stats(self, user_id: UUID) -> dict:
        """Get overall stats for a user."""
        # Total URLs
        total_urls_result = await self.db.execute(
            select(func.count(URL.id)).where(URL.user_id == user_id)
        )
        total_urls = total_urls_result.scalar() or 0

        # Total clicks
        total_clicks_result = await self.db.execute(
            select(func.sum(URL.click_count)).where(URL.user_id == user_id)
        )
        total_clicks = total_clicks_result.scalar() or 0

        return {
            "total_urls": total_urls,
            "total_clicks": total_clicks,
        }
