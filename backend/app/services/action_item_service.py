from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.action_item import ActionItem
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate, ActionItemResponse


def get_action_items_by_meeting(db: Session, meeting_id: int) -> List[ActionItemResponse]:
    items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).order_by(ActionItem.id).all()
    return items


get_meeting_action_items = get_action_items_by_meeting


def get_all_action_items(db: Session) -> List[ActionItemResponse]:
    items = db.query(ActionItem).order_by(ActionItem.completed.asc(), ActionItem.created_at.desc()).all()
    return items


def create_action_item(db: Session, meeting_id: int, item_data: ActionItemCreate) -> ActionItemResponse:
    item = ActionItem(
        meeting_id=meeting_id,
        task=item_data.task,
        assignee=item_data.assignee,
        due_date=item_data.due_date,
        completed=item_data.completed
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_action_item(db: Session, item_id: int, item_data: ActionItemUpdate) -> Optional[ActionItemResponse]:
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        return None

    if item_data.task is not None:
        item.task = item_data.task
    if item_data.assignee is not None:
        item.assignee = item_data.assignee
    if item_data.due_date is not None:
        item.due_date = item_data.due_date
    if item_data.completed is not None:
        item.completed = item_data.completed

    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


def delete_action_item(db: Session, item_id: int) -> bool:
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
