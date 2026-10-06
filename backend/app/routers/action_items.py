from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate, ActionItemResponse
from app.services.action_item_service import (
    get_meeting_action_items,
    get_all_action_items,
    create_action_item,
    update_action_item,
    delete_action_item,
)

router = APIRouter(tags=["Action Items"])


@router.get("/api/action-items", response_model=List[ActionItemResponse], summary="Get all action items across all meetings")
def list_all_action_items(db: Session = Depends(get_db)):
    return get_all_action_items(db)


@router.get("/api/meetings/{meeting_id}/action-items", response_model=List[ActionItemResponse], summary="Get action items for a specific meeting")
def list_meeting_action_items(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")
    return get_meeting_action_items(db, meeting_id)


@router.post("/api/meetings/{meeting_id}/action-items", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED, summary="Create action item for meeting")
def add_meeting_action_item(
    meeting_id: int,
    item_in: ActionItemCreate,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meeting with ID {meeting_id} not found")
    return create_action_item(db, meeting_id, item_in)


@router.put("/api/action-items/{action_item_id}", response_model=ActionItemResponse, summary="Update an action item")
def edit_action_item(
    action_item_id: int,
    item_in: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    updated = update_action_item(db, action_item_id, item_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action item with ID {action_item_id} not found")
    return updated


@router.delete("/api/action-items/{action_item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an action item")
def remove_action_item(
    action_item_id: int,
    db: Session = Depends(get_db)
):
    success = delete_action_item(db, action_item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action item with ID {action_item_id} not found")
    return None
