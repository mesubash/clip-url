from app.routers.auth import router as auth_router
from app.routers.urls import router as urls_router
from app.routers.redirect import router as redirect_router
from app.routers.admin import router as admin_router

__all__ = ["auth_router", "urls_router", "redirect_router", "admin_router"]
