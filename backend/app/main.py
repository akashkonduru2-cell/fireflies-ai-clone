import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, Base, SessionLocal
from app.routers import (
    meetings_router,
    transcript_router,
    summary_router,
    action_items_router,
    search_router,
)
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed database if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title="Meeting Intelligence Platform API",
    description="Fireflies.ai-inspired Meeting Notes, Audio Synchronization, and Action Items Workspace API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
# Allow Next.js development server (default localhost:3000) and configurable origins
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
allowed_origins = [orig.strip() for orig in allowed_origins if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(meetings_router)
app.include_router(transcript_router)
app.include_router(summary_router)
app.include_router(action_items_router)
app.include_router(search_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "Meeting Intelligence Platform API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


# Global exception handler for uncaught exceptions to return user-friendly JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please verify your request."}
    )
