from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import (
    TranscriptSegmentCreate,
    TranscriptSegmentResponse,
    TranscriptParseRequest,
)
from app.services.transcript_service import parse_raw_transcript

router = APIRouter(prefix="/api/meetings/{meeting_id}/transcript", tags=["Transcript"])


@router.get("", response_model=List[TranscriptSegmentResponse], summary="Get transcript segments for a meeting")
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_time.asc())
        .all()
    )
    return segments


@router.post("", response_model=List[TranscriptSegmentResponse], status_code=status.HTTP_201_CREATED, summary="Add or update transcript segments")
def add_transcript_segments(
    meeting_id: int,
    segments_in: List[TranscriptSegmentCreate],
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    created = []
    for s in segments_in:
        seg = TranscriptSegment(
            meeting_id=meeting_id,
            speaker=s.speaker,
            start_time=s.start_time,
            end_time=s.end_time,
            text=s.text
        )
        db.add(seg)
        created.append(seg)

    db.commit()
    for s in created:
        db.refresh(s)
    return created


@router.post("/parse", response_model=List[TranscriptSegmentResponse], summary="Parse raw text transcript into segments")
def parse_and_attach_transcript(
    meeting_id: int,
    parse_in: TranscriptParseRequest,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    parsed = parse_raw_transcript(parse_in.raw_text)
    # Clear existing segments if replacing
    db.query(TranscriptSegment).filter(TranscriptSegment.meeting_id == meeting_id).delete()

    created = []
    for s in parsed:
        seg = TranscriptSegment(
            meeting_id=meeting_id,
            speaker=s.speaker,
            start_time=s.start_time,
            end_time=s.end_time,
            text=s.text
        )
        db.add(seg)
        created.append(seg)

    db.commit()
    for s in created:
        db.refresh(s)
    return created
