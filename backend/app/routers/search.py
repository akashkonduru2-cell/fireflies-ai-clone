from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.transcript import TranscriptSegment
from app.models.action_item import ActionItem
from app.models.topic import Topic
from app.schemas.meeting import MeetingListItem
from app.services.meeting_service import format_meeting_list_item

router = APIRouter(prefix="/api/search", tags=["Search"])


class TranscriptSearchResult(BaseModel):
    segment_id: int
    meeting_id: int
    meeting_title: str
    speaker: str
    start_time: float
    end_time: float
    text: str


class ActionItemSearchResult(BaseModel):
    id: int
    meeting_id: int
    meeting_title: str
    task: str
    assignee: str
    due_date: Optional[str] = None
    completed: bool


class GlobalSearchResponse(BaseModel):
    query: str
    meetings: List[MeetingListItem]
    transcripts: List[TranscriptSearchResult]
    action_items: List[ActionItemSearchResult]
    topics: List[dict]


@router.get("", response_model=GlobalSearchResponse, summary="Global search across all resources")
def global_search(
    q: str = Query("", description="Search query string"),
    db: Session = Depends(get_db)
):
    query_str = q.strip()
    if not query_str:
        return GlobalSearchResponse(
            query="",
            meetings=[],
            transcripts=[],
            action_items=[],
            topics=[]
        )

    term = f"%{query_str.lower()}%"

    # 1. Matching meetings (by title or participant name)
    meeting_records = (
        db.query(Meeting)
        .filter(
            (func.lower(Meeting.title).like(term)) |
            (Meeting.participants.any(func.lower(Participant.name).like(term)))
        )
        .all()
    )
    meetings_formatted = [format_meeting_list_item(m) for m in meeting_records]

    # 2. Matching transcript segments
    transcript_records = (
        db.query(TranscriptSegment, Meeting.title)
        .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
        .filter(func.lower(TranscriptSegment.text).like(term))
        .limit(50)
        .all()
    )
    transcripts_formatted = [
        TranscriptSearchResult(
            segment_id=t.id,
            meeting_id=t.meeting_id,
            meeting_title=title,
            speaker=t.speaker,
            start_time=t.start_time,
            end_time=t.end_time,
            text=t.text
        )
        for t, title in transcript_records
    ]

    # 3. Matching action items
    action_records = (
        db.query(ActionItem, Meeting.title)
        .join(Meeting, ActionItem.meeting_id == Meeting.id)
        .filter(
            (func.lower(ActionItem.task).like(term)) |
            (func.lower(ActionItem.assignee).like(term))
        )
        .all()
    )
    actions_formatted = [
        ActionItemSearchResult(
            id=a.id,
            meeting_id=a.meeting_id,
            meeting_title=title,
            task=a.task,
            assignee=a.assignee,
            due_date=a.due_date,
            completed=a.completed
        )
        for a, title in action_records
    ]

    # 4. Matching topics
    topic_records = (
        db.query(Topic, Meeting.title)
        .join(Meeting, Topic.meeting_id == Meeting.id)
        .filter(func.lower(Topic.name).like(term))
        .all()
    )
    topics_formatted = [
        {
            "id": top.id,
            "meeting_id": top.meeting_id,
            "meeting_title": title,
            "name": top.name
        }
        for top, title in topic_records
    ]

    return GlobalSearchResponse(
        query=query_str,
        meetings=meetings_formatted,
        transcripts=transcripts_formatted,
        action_items=actions_formatted,
        topics=topics_formatted
    )
