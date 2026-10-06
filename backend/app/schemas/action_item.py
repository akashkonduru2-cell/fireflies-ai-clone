from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ActionItemBase(BaseModel):
    task: str = Field(..., min_length=1, max_length=500, description="Task description")
    assignee: str = Field(..., min_length=1, max_length=150, description="Assignee name")
    due_date: Optional[str] = Field(None, max_length=50, description="Due date string e.g. 'Oct 15, 2026' or ISO")
    completed: bool = Field(False, description="Whether action item is completed")


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    task: Optional[str] = Field(None, min_length=1, max_length=500)
    assignee: Optional[str] = Field(None, min_length=1, max_length=150)
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
