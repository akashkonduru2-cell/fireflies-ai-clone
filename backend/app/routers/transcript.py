from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import (
    TranscriptSegmentCreate,
    TranscriptSegmentUpdate,
    TranscriptSegmentResponse,
    TranscriptParseRequest,
)
from app.services.transcript_service import parse_raw_transcript, update_transcript_segment

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


@router.post("", response_model=List[TranscriptSegmentResponse], status_code=status.HTTP_201_CREATED, summary="Add transcript segments")
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


@router.patch("/{segment_id}", response_model=TranscriptSegmentResponse, summary="Update a specific transcript segment line")
@router.put("/{segment_id}", response_model=TranscriptSegmentResponse, summary="Update a specific transcript segment line")
def update_transcript_line(
    meeting_id: int,
    segment_id: int,
    segment_in: TranscriptSegmentUpdate,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")

    updated = update_transcript_segment(
        db=db,
        meeting_id=meeting_id,
        segment_id=segment_id,
        text=segment_in.text,
        speaker=segment_in.speaker,
        start_time=segment_in.start_time,
        end_time=segment_in.end_time
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript segment {segment_id} not found in meeting {meeting_id}"
        )

    return updated


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
