from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from user_agents import parse

from app.models import URL, Analytics
from app.schemas import (
    AnalyticsResponse,
    ClickData,
    CountryData,
    DeviceData,
    RecentActivity,
)


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_click(
        self,
        url_id: int,
        ip_address: str | None = None,
        user_agent: str | None = None,
        country: str | None = None,
        city: str | None = None,
        referrer: str | None = None,
    ) -> Analytics:
        """Log a click event."""
        device = None
        browser = None
        os = None

        if user_agent:
            ua = parse(user_agent)
            device = "Mobile" if ua.is_mobile else ("Tablet" if ua.is_tablet else "Desktop")
            browser = ua.browser.family
            os = ua.os.family

        analytics = Analytics(
            url_id=url_id,
            ip_address=ip_address,
            user_agent=user_agent,
            country=country,
            city=city,
            device=device,
            browser=browser,
            os=os,
            referrer=referrer,
        )
        self.db.add(analytics)
        await self.db.commit()
        return analytics

    async def get_url_analytics(self, url_id: int, user_id: UUID) -> AnalyticsResponse:
        """Get analytics for a specific URL."""
        # Verify ownership
        url_result = await self.db.execute(
            select(URL).where(URL.id == url_id, URL.user_id == user_id)
        )
        url = url_result.scalar_one_or_none()
        if not url:
            raise ValueError("URL not found")

        return await self._build_analytics_response(url_id)

    async def get_user_analytics(self, user_id: UUID) -> AnalyticsResponse:
        """Get aggregated analytics for all user URLs."""
        # Get all user URL IDs
        urls_result = await self.db.execute(
            select(URL.id).where(URL.user_id == user_id)
        )
        url_ids = [row[0] for row in urls_result.fetchall()]

        if not url_ids:
            return AnalyticsResponse(
                total_clicks=0,
                unique_visitors=0,
                avg_daily_clicks=0,
                countries_count=0,
                click_data=[],
                top_countries=[],
                devices=[],
                recent_activity=[],
            )

        return await self._build_analytics_response(url_ids=url_ids)

    async def _build_analytics_response(
        self, url_id: int | None = None, url_ids: list[int] | None = None
    ) -> AnalyticsResponse:
        """Build analytics response for single URL or multiple URLs."""
        if url_id:
            filter_condition = Analytics.url_id == url_id
        elif url_ids:
            filter_condition = Analytics.url_id.in_(url_ids)
        else:
            raise ValueError("Either url_id or url_ids must be provided")

        # Total clicks
        total_clicks_result = await self.db.execute(
            select(func.count(Analytics.id)).where(filter_condition)
        )
        total_clicks = total_clicks_result.scalar() or 0

        # Unique visitors (by IP)
        unique_visitors_result = await self.db.execute(
            select(func.count(func.distinct(Analytics.ip_address))).where(filter_condition)
        )
        unique_visitors = unique_visitors_result.scalar() or 0

        # Click data for last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        click_data = await self._get_click_data(filter_condition, seven_days_ago)

        # Average daily clicks
        avg_daily_clicks = total_clicks / 7 if total_clicks > 0 else 0

        # Top countries
        top_countries = await self._get_top_countries(filter_condition, total_clicks)

        # Countries count
        countries_count_result = await self.db.execute(
            select(func.count(func.distinct(Analytics.country))).where(
                and_(filter_condition, Analytics.country.isnot(None))
            )
        )
        countries_count = countries_count_result.scalar() or 0

        # Devices
        devices = await self._get_devices(filter_condition, total_clicks)

        # Recent activity
        recent_activity = await self._get_recent_activity(filter_condition)

        return AnalyticsResponse(
            total_clicks=total_clicks,
            unique_visitors=unique_visitors,
            avg_daily_clicks=round(avg_daily_clicks, 1),
            countries_count=countries_count,
            click_data=click_data,
            top_countries=top_countries,
            devices=devices,
            recent_activity=recent_activity,
        )

    async def _get_click_data(self, filter_condition, start_date: datetime) -> list[ClickData]:
        """Get click data grouped by date."""
        result = await self.db.execute(
            select(
                func.date(Analytics.timestamp).label("date"),
                func.count(Analytics.id).label("clicks"),
            )
            .where(and_(filter_condition, Analytics.timestamp >= start_date))
            .group_by(func.date(Analytics.timestamp))
            .order_by(func.date(Analytics.timestamp))
        )
        rows = result.fetchall()
        return [
            ClickData(date=row.date.strftime("%b %d"), clicks=row.clicks)
            for row in rows
        ]

    async def _get_top_countries(
        self, filter_condition, total_clicks: int
    ) -> list[CountryData]:
        """Get top countries by clicks."""
        result = await self.db.execute(
            select(
                Analytics.country,
                func.count(Analytics.id).label("clicks"),
            )
            .where(and_(filter_condition, Analytics.country.isnot(None)))
            .group_by(Analytics.country)
            .order_by(func.count(Analytics.id).desc())
            .limit(5)
        )
        rows = result.fetchall()
        return [
            CountryData(
                country=row.country or "Unknown",
                clicks=row.clicks,
                percentage=round((row.clicks / total_clicks) * 100, 1) if total_clicks > 0 else 0,
            )
            for row in rows
        ]

    async def _get_devices(self, filter_condition, total_clicks: int) -> list[DeviceData]:
        """Get device distribution."""
        result = await self.db.execute(
            select(
                Analytics.device,
                func.count(Analytics.id).label("count"),
            )
            .where(and_(filter_condition, Analytics.device.isnot(None)))
            .group_by(Analytics.device)
            .order_by(func.count(Analytics.id).desc())
        )
        rows = result.fetchall()
        return [
            DeviceData(
                type=row.device or "Unknown",
                percentage=round((row.count / total_clicks) * 100, 1) if total_clicks > 0 else 0,
            )
            for row in rows
        ]

    async def _get_recent_activity(self, filter_condition) -> list[RecentActivity]:
        """Get recent activity."""
        result = await self.db.execute(
            select(Analytics)
            .where(filter_condition)
            .order_by(Analytics.timestamp.desc())
            .limit(5)
        )
        rows = result.scalars().all()
        
        now = datetime.utcnow()
        activities = []
        
        for row in rows:
            # Calculate time ago
            diff = now - row.timestamp
            if diff.seconds < 60:
                time_ago = "Just now"
            elif diff.seconds < 3600:
                time_ago = f"{diff.seconds // 60} min ago"
            elif diff.seconds < 86400:
                time_ago = f"{diff.seconds // 3600} hr ago"
            else:
                time_ago = f"{diff.days} days ago"
            
            location_parts = []
            if row.city:
                location_parts.append(row.city)
            if row.country:
                location_parts.append(row.country)
            location = ", ".join(location_parts) if location_parts else "Unknown"
            
            device = f"{row.browser or 'Unknown'} / {row.os or 'Unknown'}"
            
            activities.append(RecentActivity(
                time=time_ago,
                location=location,
                device=device,
            ))
        
        return activities
