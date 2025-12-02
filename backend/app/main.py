from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth_router, urls_router, redirect_router, admin_router, feedback_router

settings = get_settings()

# Configure logging based on DEBUG setting
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s" if settings.debug else "%(levelname)s - %(message)s",
)

# Suppress noisy loggers in production
if not settings.debug:
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title="ClipURL API",
    description="A modern, high-performance URL shortener API by ClipURL",
    version="1.0.0",
    lifespan=lifespan,
    # Disable docs in production
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://clipurl.subashsdhami.com.np",
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(urls_router)
app.include_router(redirect_router)
app.include_router(admin_router)
app.include_router(feedback_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "ClipURL API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check for deployment platforms."""
    return {"status": "healthy"}
