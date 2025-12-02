import httpx
from typing import Optional
import secrets
from datetime import datetime, timedelta

from app.config import get_settings

settings = get_settings()

# List of disposable/temporary email domains to block
DISPOSABLE_EMAIL_DOMAINS = {
    # Popular temporary email services
    "10minutemail.com", "10minutemail.net", "10minmail.com",
    "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
    "tempmail.com", "temp-mail.org", "temp-mail.io",
    "throwaway.email", "throwawaymail.com",
    "mailinator.com", "mailinator.net", "mailinator.org",
    "yopmail.com", "yopmail.fr", "yopmail.net",
    "fakeinbox.com", "fakemailgenerator.com",
    "getnada.com", "nada.email",
    "dispostable.com", "disposablemail.com",
    "trashmail.com", "trashmail.net", "trashmail.org",
    "maildrop.cc", "mailnesia.com",
    "tempinbox.com", "tempmailaddress.com",
    "sharklasers.com", "spam4.me", "spamgourmet.com",
    "getairmail.com", "mohmal.com",
    "emailondeck.com", "emailfake.com",
    "crazymailing.com", "tempmailo.com",
    "mintemail.com", "mytemp.email",
    "mailcatch.com", "mailexpire.com",
    "discard.email", "discardmail.com",
    "spamex.com", "spamfree24.org",
    "mailnator.com", "incognitomail.org",
    "anonbox.net", "anonymbox.com",
    "burnermail.io", "33mail.com",
    "dropmail.me", "emailsensei.com",
    "filzmail.com", "fizmail.com",
    "grandmamail.com", "harakirimail.com",
    "imgof.com", "jetable.org",
    "kasmail.com", "mailcatch.com",
    "mailforspam.com", "mailinator2.com",
    "mailmoat.com", "mailnull.com",
    "mailshell.com", "mailsiphon.com",
    "mailslite.com", "mailzilla.com",
    "nomail.xl.cx", "nowmymail.com",
    "pookmail.com", "proxymail.eu",
    "rcpt.at", "rejectmail.com",
    "safetymail.info", "safetypost.de",
    "sendspamhere.com", "sofimail.com",
    "sogetthis.com", "soodonims.com",
    "spam.la", "spamavert.com",
    "spambob.com", "spambog.com",
    "spambox.info", "spambox.us",
    "spamcannon.com", "spamcannon.net",
    "spamcon.org", "spamcorptastic.com",
    "spamcowboy.com", "spamcowboy.net",
    "spamcowboy.org", "spamday.com",
    "spameater.org", "spamfree.eu",
    "spamherelots.com", "spamhereplease.com",
    "spamhole.com", "spamify.com",
    "spaminator.de", "spamkill.info",
    "spaml.com", "spaml.de",
    "spamoff.de", "spamslicer.com",
    "spamspot.com", "spamthis.co.uk",
    "spamtroll.net", "supergreatmail.com",
    "teleworm.com", "teleworm.us",
    "tempail.com", "tempe-mail.com",
    "tempemail.biz", "tempemail.com",
    "tempmail.co", "tempmail.de",
    "tempmail.it", "tempmailer.com",
    "tempomail.fr", "temporaryemail.net",
    "temporaryemail.us", "tempthe.net",
    "thankyou2010.com", "thisisnotmyrealemail.com",
    "throam.com", "tilien.com",
    "tmailinator.com", "trash-amil.com",
    "trash-mail.at", "trash-mail.com",
    "trashdevil.com", "trashdevil.de",
    "trashemail.de", "trashmail.at",
    "trashmail.me", "trashmail.ws",
    "trashymail.com", "trashymail.net",
    "trbvm.com", "trickmail.net",
    "tyldd.com", "uggsrock.com",
    "upliftnow.com", "uplipht.com",
    "venompen.com", "veryrealemail.com",
    "viditag.com", "viewcastmedia.com",
    "webm4il.info", "wegwerfadresse.de",
    "wegwerfemail.de", "wegwerfmail.de",
    "wegwerfmail.net", "wegwerfmail.org",
    "wetrainbayarea.com", "wetrainbayarea.org",
    "wh4f.org", "whopy.com",
    "willselfdestruct.com", "winemaven.info",
    "wronghead.com", "wuzup.net",
    "wuzupmail.net", "wwwnew.eu",
    "xagloo.com", "xemaps.com",
    "xents.com", "xmaily.com",
    "xoxy.net", "yapped.net",
    "yeah.net", "yopmail.gq",
    "ypmail.webarnak.fr.eu.org", "yuurok.com",
    "zehnminutenmail.de", "zippymail.info",
    "zoaxe.com", "zoemail.org",
}


def is_disposable_email(email: str) -> bool:
    """Check if email is from a disposable/temporary email provider."""
    domain = email.lower().split("@")[-1]
    return domain in DISPOSABLE_EMAIL_DOMAINS


def generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def get_token_expiry(hours: int = 24) -> datetime:
    """Get expiry datetime for a token."""
    return datetime.utcnow() + timedelta(hours=hours)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """Send an email using Resend API."""
    if not settings.resend_api_key:
        print(f"[EMAIL] Resend not configured. Would send to {to_email}: {subject}")
        return True  # Return True in dev mode without email config
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.email_from_name} <{settings.email_from}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content,
                    "text": text_content,
                },
                timeout=30.0,
            )
            
            if response.status_code == 200:
                print(f"[EMAIL] Successfully sent email to {to_email}")
                return True
            else:
                print(f"[EMAIL ERROR] Resend API error: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {type(e).__name__}: {e}")
        return False


async def send_verification_email(to_email: str, name: str, token: str) -> bool:
    """Send email verification email."""
    verification_url = f"{settings.frontend_url}/verify-email?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 30px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; }}
            .footer {{ margin-top: 40px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">ClipURL</div>
            <h2>Verify your email address</h2>
            <p>Hi {name},</p>
            <p>Thanks for signing up for ClipURL! Please verify your email address by clicking the button below:</p>
            <p style="margin: 30px 0;">
                <a href="{verification_url}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
                <p>If you didn't create an account with ClipURL, you can safely ignore this email.</p>
                <p>© {datetime.now().year} ClipURL. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Verify your email address
    
    Hi {name},
    
    Thanks for signing up for ClipURL! Please verify your email address by clicking the link below:
    
    {verification_url}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with ClipURL, you can safely ignore this email.
    """
    
    return await send_email(to_email, "Verify your email - ClipURL", html_content, text_content)


async def send_password_reset_email(to_email: str, name: str, token: str) -> bool:
    """Send password reset email."""
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 30px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; }}
            .footer {{ margin-top: 40px; color: #6b7280; font-size: 14px; }}
            .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">ClipURL</div>
            <h2>Reset your password</h2>
            <p>Hi {name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="margin: 30px 0;">
                <a href="{reset_url}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">{reset_url}</p>
            <div class="warning">
                <strong>⚠️ This link will expire in 1 hour.</strong>
            </div>
            <div class="footer">
                <p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
                <p>© {datetime.now().year} ClipURL. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Reset your password
    
    Hi {name},
    
    We received a request to reset your password. Click the link below to create a new password:
    
    {reset_url}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
    """
    
    return await send_email(to_email, "Reset your password - ClipURL", html_content, text_content)


async def send_welcome_email(to_email: str, name: str) -> bool:
    """Send welcome email after verification."""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 30px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; }}
            .feature {{ padding: 15px; background: #f3f4f6; border-radius: 8px; margin: 10px 0; }}
            .footer {{ margin-top: 40px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">ClipURL</div>
            <h2>Welcome to ClipURL! 🎉</h2>
            <p>Hi {name},</p>
            <p>Your email has been verified. You're all set to start using ClipURL!</p>
            <h3>Here's what you can do:</h3>
            <div class="feature">🔗 <strong>Clip URLs</strong> - Transform long URLs into short, memorable links</div>
            <div class="feature">📊 <strong>Track Analytics</strong> - Monitor clicks, locations, and devices</div>
            <div class="feature">🔑 <strong>API Access</strong> - Integrate ClipURL with your applications</div>
            <p style="margin: 30px 0;">
                <a href="{settings.frontend_url}/dashboard" class="button">Go to Dashboard</a>
            </p>
            <div class="footer">
                <p>© {datetime.now().year} ClipURL. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(to_email, "Welcome to ClipURL! 🎉", html_content)
