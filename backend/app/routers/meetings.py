from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingListItem, MeetingDetailResponse
from app.services.meeting_service import (
    get_meetings,
    get_meeting_by_id,
    create_meeting,
    update_meeting,
    delete_meeting,
)

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


@router.get("", response_model=List[MeetingListItem], summary="List all meetings with search, filter, and sort")
def list_meetings(
    search: Optional[str] = Query(None, description="Search by title or participant name"),
    filter: Optional[str] = Query("all", description="Date filter: all, today, week, older"),
    sort: Optional[str] = Query("newest", description="Sort by: newest, oldest, longest, shortest"),
    db: Session = Depends(get_db)
):
    return get_meetings(db, search=search, filter_date=filter, sort=sort)


@router.get("/{meeting_id}", response_model=MeetingDetailResponse, summary="Get full meeting details")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")
    return meeting


@router.post("", response_model=MeetingDetailResponse, status_code=status.HTTP_201_CREATED, summary="Create a new meeting")
def create_new_meeting(meeting_in: MeetingCreate, db: Session = Depends(get_db)):
    if not meeting_in.title.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Meeting title cannot be empty")
    return create_meeting(db, meeting_in)


@router.put("/{meeting_id}", response_model=MeetingDetailResponse, summary="Update meeting metadata")
def update_existing_meeting(meeting_id: int, meeting_in: MeetingUpdate, db: Session = Depends(get_db)):
    updated = update_meeting(db, meeting_id, meeting_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")
    return updated


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete meeting and all associated data")
def delete_existing_meeting(meeting_id: int, db: Session = Depends(get_db)):
    success = delete_meeting(db, meeting_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")
    return None
