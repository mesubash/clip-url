from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth_router, urls_router, redirect_router, admin_router

settings = get_settings()


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
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:8080", "http://localhost:5173", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(urls_router)
app.include_router(redirect_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "ClipURL API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check for deployment platforms."""
    return {"status": "healthy"}
