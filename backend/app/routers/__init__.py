from app.routers.meetings import router as meetings_router
from app.routers.transcript import router as transcript_router
from app.routers.summary import router as summary_router
from app.routers.action_items import router as action_items_router
from app.routers.search import router as search_router

__all__ = [
    "meetings_router",
    "transcript_router",
    "summary_router",
    "action_items_router",
    "search_router",
]
