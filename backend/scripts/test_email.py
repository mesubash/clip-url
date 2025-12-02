#!/usr/bin/env python3
"""Test email sending via Resend."""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email_service import send_email
from app.config import get_settings

settings = get_settings()


async def main():
    print(f"Testing Resend with API Key: {settings.resend_api_key[:15]}...")
    print(f"From: {settings.email_from}")
    print()
    print("Sending test email...")
    
    result = await send_email(
        to_email="mesubash10@gmail.com",
        subject="Test Email from ClipURL",
        html_content="""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Hello from ClipURL!</h1>
            <p>This is a test email to verify Resend is working correctly.</p>
            <p>If you received this, your email configuration is set up properly! 🎉</p>
        </div>
        """,
        text_content="Hello from ClipURL! This is a test email to verify Resend is working."
    )
    
    if result:
        print("✅ Email sent successfully! Check your inbox.")
    else:
        print("❌ Failed to send email. Check the error above.")


if __name__ == "__main__":
    asyncio.run(main())
