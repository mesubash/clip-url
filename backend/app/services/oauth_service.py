import httpx
from typing import Optional
from dataclasses import dataclass

from app.config import get_settings

settings = get_settings()


@dataclass
class GoogleUserInfo:
    """Google user info from OAuth."""
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    verified_email: bool = False


class GoogleOAuthError(Exception):
    """Custom exception for Google OAuth errors."""
    pass


async def get_google_auth_url(redirect_uri: str, state: Optional[str] = None) -> str:
    """Generate Google OAuth authorization URL."""
    if not settings.google_client_id:
        raise GoogleOAuthError("Google OAuth is not configured")
    
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    if state:
        params["state"] = state
    
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"


async def exchange_code_for_tokens(code: str, redirect_uri: str) -> dict:
    """Exchange authorization code for access tokens."""
    if not settings.google_client_id or not settings.google_client_secret:
        raise GoogleOAuthError("Google OAuth is not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )
        
        if response.status_code != 200:
            error_data = response.json()
            raise GoogleOAuthError(f"Failed to exchange code: {error_data.get('error_description', 'Unknown error')}")
        
        return response.json()


async def get_google_user_info(access_token: str) -> GoogleUserInfo:
    """Get user info from Google using access token."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        
        if response.status_code != 200:
            raise GoogleOAuthError("Failed to get user info from Google")
        
        data = response.json()
        
        return GoogleUserInfo(
            id=data["id"],
            email=data["email"],
            name=data.get("name", data["email"].split("@")[0]),
            picture=data.get("picture"),
            verified_email=data.get("verified_email", False),
        )


async def verify_google_id_token(id_token: str) -> GoogleUserInfo:
    """Verify Google ID token and extract user info (for frontend SDK flow)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        )
        
        if response.status_code != 200:
            raise GoogleOAuthError("Invalid ID token")
        
        data = response.json()
        
        # Verify the token is for our app
        if data.get("aud") != settings.google_client_id:
            raise GoogleOAuthError("Token was not issued for this application")
        
        return GoogleUserInfo(
            id=data["sub"],
            email=data["email"],
            name=data.get("name", data["email"].split("@")[0]),
            picture=data.get("picture"),
            verified_email=data.get("email_verified", "false") == "true",
        )
