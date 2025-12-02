#!/usr/bin/env python3
"""
Seed script to create test users for development.
Run from backend directory: python -m scripts.seed
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.config import get_settings
from app.models import User
from app.utils.hashing import get_password_hash

settings = get_settings()

# Test users to seed
SEED_USERS = [
    {
        "name": "Admin User",
        "email": "admin@clipurl.com.np",
        "password": "adminpassword",
        "is_admin": True,
    },
    {
        "name": "Test User",
        "email": "user@clipurl.com.np",
        "password": "userpassword",
        "is_admin": False,
    },
]


async def seed_users():
    """Seed test users into the database."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        for user_data in SEED_USERS:
            # Check if user already exists
            result = await db.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print(f"⚠️  User '{user_data['email']}' already exists, skipping...")
                continue

            # Create new user
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role="admin" if user_data.get("is_admin") else "user",
                is_active=True,
                email_verified=True,  # Seed users are pre-verified
            )
            db.add(user)
            await db.commit()
            role_label = "admin" if user_data.get("is_admin") else "user"
            print(f"✅ Created user: {user_data['email']} (password: {user_data['password']}, role: {role_label})")

    await engine.dispose()
    print("\n🎉 Seeding complete!")


if __name__ == "__main__":
    print("🌱 Seeding database with test users...\n")
    asyncio.run(seed_users())
