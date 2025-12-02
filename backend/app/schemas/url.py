from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field


class URLCreate(BaseModel):
    original_url: HttpUrl
    custom_alias: str | None = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    expires_at: datetime | None = None


class URLUpdate(BaseModel):
    alias: str | None = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    expires_at: datetime | None = None


class URLResponse(BaseModel):
    id: int
    slug: str
    original_url: str
    short_url: str
    click_count: int
    created_at: datetime
    expires_at: datetime | None = None

    class Config:
        from_attributes = True


class URLListResponse(BaseModel):
    urls: list[URLResponse]
    total: int
    total_clicks: int


class ClickData(BaseModel):
    date: str
    clicks: int


class CountryData(BaseModel):
    country: str
    clicks: int
    percentage: float


class DeviceData(BaseModel):
    type: str
    percentage: float


class RecentActivity(BaseModel):
    time: str
    location: str
    device: str


class AnalyticsResponse(BaseModel):
    total_clicks: int
    unique_visitors: int
    avg_daily_clicks: float
    countries_count: int
    click_data: list[ClickData]
    top_countries: list[CountryData]
    devices: list[DeviceData]
    recent_activity: list[RecentActivity]
