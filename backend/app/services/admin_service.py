from uuid import UUID
from math import ceil
from sqlalchemy import select, func, delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, URL, Analytics
from app.schemas import (
    UserListResponse,
    AdminUserCreate,
    AdminUserUpdate,
    PaginatedUsersResponse,
)
from app.utils import get_password_hash
from app.services.email_service import is_disposable_email, generate_token, get_token_expiry


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_users(
        self,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        role: str | None = None,
        is_active: bool | None = None,
    ) -> PaginatedUsersResponse:
        """Get paginated list of users."""
        # Build query
        query = select(User)
        count_query = select(func.count(User.id))
        
        # Apply filters
        if search:
            search_filter = User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        if role:
            query = query.where(User.role == role)
            count_query = count_query.where(User.role == role)
        
        if is_active is not None:
            query = query.where(User.is_active == is_active)
            count_query = count_query.where(User.is_active == is_active)
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
        offset = (page - 1) * per_page
        query = query.order_by(User.created_at.desc()).offset(offset).limit(per_page)
        
        # Execute query
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        # Get URL counts for each user
        user_list = []
        for user in users:
            url_count_result = await self.db.execute(
                select(func.count(URL.id)).where(URL.user_id == user.id)
            )
            url_count = url_count_result.scalar() or 0
            
            user_data = UserListResponse(
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
            user_list.append(user_data)
        
        return PaginatedUsersResponse(
            users=user_list,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=ceil(total / per_page) if total > 0 else 1,
        )

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def create_user(self, data: AdminUserCreate) -> UserListResponse:
        """Create a new user as admin."""
        email = data.email.lower()
        
        # Check for disposable email
        if is_disposable_email(email):
            raise ValueError("Temporary/disposable email addresses are not allowed")
        
        # Check if user already exists
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create new user
        user = User(
            email=email,
            name=data.name,
            password_hash=get_password_hash(data.password),
            role=data.role,
            is_verified=data.is_verified,
            is_active=True,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
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
            url_count=0,
        )

    async def update_user(self, user_id: UUID, data: AdminUserUpdate) -> UserListResponse:
        """Update a user's details."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if data.name is not None:
            user.name = data.name
        
        if data.email is not None:
            new_email = data.email.lower()
            if new_email != user.email:
                # Check for disposable email
                if is_disposable_email(new_email):
                    raise ValueError("Temporary/disposable email addresses are not allowed")
                
                # Check if email is already taken
                existing = await self.get_user_by_email(new_email)
                if existing:
                    raise ValueError("Email already in use")
                user.email = new_email
        
        if data.role is not None:
            if data.role not in ["admin", "user"]:
                raise ValueError("Invalid role. Must be 'admin' or 'user'")
            user.role = data.role
        
        if data.is_active is not None:
            user.is_active = data.is_active
        
        if data.is_verified is not None:
            user.is_verified = data.is_verified
        
        await self.db.commit()
        await self.db.refresh(user)
        
        # Get URL count
        url_count_result = await self.db.execute(
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

    async def delete_user(self, user_id: UUID, current_user_id: UUID) -> bool:
        """Delete a user and all associated data (URLs, Analytics)."""
        if user_id == current_user_id:
            raise ValueError("Cannot delete your own account")
        
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Get all URL IDs for this user
        url_result = await self.db.execute(
            select(URL.id).where(URL.user_id == user_id)
        )
        url_ids = [row[0] for row in url_result.fetchall()]
        
        # Delete analytics for all user's URLs first
        if url_ids:
            await self.db.execute(
                delete(Analytics).where(Analytics.url_id.in_(url_ids))
            )
        
        # Delete all user's URLs
        await self.db.execute(
            delete(URL).where(URL.user_id == user_id)
        )
        
        # Finally delete the user
        await self.db.execute(
            delete(User).where(User.id == user_id)
        )
        
        await self.db.commit()
        return True

    async def toggle_user_status(self, user_id: UUID, current_user_id: UUID) -> UserListResponse:
        """Toggle a user's active status."""
        if user_id == current_user_id:
            raise ValueError("Cannot deactivate your own account")
        
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        user.is_active = not user.is_active
        await self.db.commit()
        await self.db.refresh(user)
        
        # Get URL count
        url_count_result = await self.db.execute(
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

    async def get_dashboard_stats(self) -> dict:
        """Get admin dashboard statistics."""
        # Total users
        total_users_result = await self.db.execute(select(func.count(User.id)))
        total_users = total_users_result.scalar() or 0
        
        # Active users
        active_users_result = await self.db.execute(
            select(func.count(User.id)).where(User.is_active == True)
        )
        active_users = active_users_result.scalar() or 0
        
        # Verified users
        verified_users_result = await self.db.execute(
            select(func.count(User.id)).where(User.is_verified == True)
        )
        verified_users = verified_users_result.scalar() or 0
        
        # Total URLs
        total_urls_result = await self.db.execute(select(func.count(URL.id)))
        total_urls = total_urls_result.scalar() or 0
        
        # Total clicks
        total_clicks_result = await self.db.execute(select(func.sum(URL.click_count)))
        total_clicks = total_clicks_result.scalar() or 0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "total_urls": total_urls,
            "total_clicks": total_clicks,
        }

    async def get_cleanup_stats(self) -> dict:
        """Get statistics about data that can be cleaned up."""
        # Use database's current timestamp to avoid timezone issues with existing data
        
        # Expired links count
        expired_links_result = await self.db.execute(
            select(func.count(URL.id)).where(URL.expires_at < func.now())
        )
        expired_links = expired_links_result.scalar() or 0
        
        # Unverified users older than 7 days
        unverified_users_result = await self.db.execute(
            select(func.count(User.id)).where(
                User.is_verified == False,
                User.oauth_provider == None,  # Don't count OAuth users
                User.created_at < func.now() - text("interval '7 days'")
            )
        )
        unverified_users = unverified_users_result.scalar() or 0
        
        # Inactive users (no links created, older than 30 days)
        # Get users with no URLs
        subquery = select(URL.user_id).distinct()
        inactive_users_result = await self.db.execute(
            select(func.count(User.id)).where(
                User.id.notin_(subquery),
                User.created_at < func.now() - text("interval '30 days'"),
                User.role != "admin"
            )
        )
        inactive_users = inactive_users_result.scalar() or 0
        
        # Links with zero clicks older than 90 days
        zero_click_links_result = await self.db.execute(
            select(func.count(URL.id)).where(
                URL.click_count == 0,
                URL.created_at < func.now() - text("interval '90 days'")
            )
        )
        zero_click_links = zero_click_links_result.scalar() or 0
        
        # Analytics older than 1 year
        old_analytics_result = await self.db.execute(
            select(func.count(Analytics.id)).where(
                Analytics.timestamp < func.now() - text("interval '365 days'")
            )
        )
        old_analytics = old_analytics_result.scalar() or 0
        
        return {
            "expired_links": expired_links,
            "unverified_users": unverified_users,
            "inactive_users": inactive_users,
            "zero_click_links": zero_click_links,
            "old_analytics": old_analytics,
        }

    async def cleanup_expired_links(self, dry_run: bool = True) -> dict:
        """Delete expired links and their analytics."""
        # Get expired URLs
        expired_result = await self.db.execute(
            select(URL).where(URL.expires_at < func.now())
        )
        expired_urls = expired_result.scalars().all()
        count = len(expired_urls)
        
        if not dry_run and count > 0:
            # Delete analytics for expired URLs
            url_ids = [url.id for url in expired_urls]
            await self.db.execute(
                delete(Analytics).where(Analytics.url_id.in_(url_ids))
            )
            # Delete expired URLs
            await self.db.execute(
                delete(URL).where(URL.expires_at < func.now())
            )
            await self.db.commit()
        
        return {
            "type": "expired_links",
            "count": count,
            "deleted": not dry_run,
        }

    async def cleanup_unverified_users(self, days_old: int = 7, dry_run: bool = True) -> dict:
        """Delete unverified users older than specified days."""
        interval = text(f"interval '{days_old} days'")
        
        # Get unverified users
        result = await self.db.execute(
            select(User).where(
                User.is_verified == False,
                User.oauth_provider == None,
                User.created_at < func.now() - interval
            )
        )
        users = result.scalars().all()
        count = len(users)
        
        if not dry_run and count > 0:
            user_ids = [user.id for user in users]
            # Delete their URLs' analytics first
            url_result = await self.db.execute(
                select(URL.id).where(URL.user_id.in_(user_ids))
            )
            url_ids = [row[0] for row in url_result.fetchall()]
            if url_ids:
                await self.db.execute(
                    delete(Analytics).where(Analytics.url_id.in_(url_ids))
                )
            # Delete their URLs
            await self.db.execute(
                delete(URL).where(URL.user_id.in_(user_ids))
            )
            # Delete users
            await self.db.execute(
                delete(User).where(User.id.in_(user_ids))
            )
            await self.db.commit()
        
        return {
            "type": "unverified_users",
            "count": count,
            "days_old": days_old,
            "deleted": not dry_run,
        }

    async def cleanup_zero_click_links(self, days_old: int = 90, dry_run: bool = True) -> dict:
        """Delete links with zero clicks older than specified days."""
        interval = text(f"interval '{days_old} days'")
        
        # Get zero-click URLs
        result = await self.db.execute(
            select(URL).where(
                URL.click_count == 0,
                URL.created_at < func.now() - interval
            )
        )
        urls = result.scalars().all()
        count = len(urls)
        
        if not dry_run and count > 0:
            url_ids = [url.id for url in urls]
            # Delete analytics (should be empty but just in case)
            await self.db.execute(
                delete(Analytics).where(Analytics.url_id.in_(url_ids))
            )
            # Delete URLs
            await self.db.execute(
                delete(URL).where(URL.id.in_(url_ids))
            )
            await self.db.commit()
        
        return {
            "type": "zero_click_links",
            "count": count,
            "days_old": days_old,
            "deleted": not dry_run,
        }

    async def cleanup_old_analytics(self, days_old: int = 365, dry_run: bool = True) -> dict:
        """Delete analytics records older than specified days."""
        interval = text(f"interval '{days_old} days'")
        
        # Count old analytics
        count_result = await self.db.execute(
            select(func.count(Analytics.id)).where(
                Analytics.timestamp < func.now() - interval
            )
        )
        count = count_result.scalar() or 0
        
        if not dry_run and count > 0:
            await self.db.execute(
                delete(Analytics).where(
                    Analytics.timestamp < func.now() - interval
                )
            )
            await self.db.commit()
        
        return {
            "type": "old_analytics",
            "count": count,
            "days_old": days_old,
            "deleted": not dry_run,
        }

    async def cleanup_inactive_users(self, days_old: int = 30, dry_run: bool = True) -> dict:
        """Delete users with no links who haven't been active for specified days."""
        interval = text(f"interval '{days_old} days'")
        
        # Get users with no URLs
        subquery = select(URL.user_id).distinct()
        result = await self.db.execute(
            select(User).where(
                User.id.notin_(subquery),
                User.created_at < func.now() - interval,
                User.role != "admin"
            )
        )
        users = result.scalars().all()
        count = len(users)
        
        if not dry_run and count > 0:
            user_ids = [user.id for user in users]
            await self.db.execute(
                delete(User).where(User.id.in_(user_ids))
            )
            await self.db.commit()
        
        return {
            "type": "inactive_users",
            "count": count,
            "days_old": days_old,
            "deleted": not dry_run,
        }
