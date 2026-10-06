from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.schemas.summary import SummaryUpdate, SummaryResponse
from app.services.summary_service import get_meeting_summary, upsert_meeting_summary

router = APIRouter(prefix="/api/meetings/{meeting_id}/summary", tags=["Summary"])


@router.get("", response_model=SummaryResponse, summary="Get summary for a meeting")
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    summary = get_meeting_summary(db, meeting_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Summary for meeting {meeting_id} not found")
    return summary


@router.put("", response_model=SummaryResponse, summary="Update or create summary for a meeting")
def update_summary(meeting_id: int, summary_in: SummaryUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    return upsert_meeting_summary(db, meeting_id, summary_in)
