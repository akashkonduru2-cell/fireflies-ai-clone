from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.participant import ParticipantCreate, ParticipantResponse
from app.schemas.transcript import TranscriptSegmentCreate, TranscriptSegmentResponse
from app.schemas.summary import SummaryCreate, SummaryResponse
from app.schemas.topic import TopicCreate, TopicResponse
from app.schemas.action_item import ActionItemCreate, ActionItemResponse


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Meeting title")
    meeting_date: datetime = Field(default_factory=datetime.utcnow, description="Meeting date and time")
    duration: int = Field(1800, ge=1, description="Duration in seconds (e.g., 1800 for 30 mins)")
    audio_url: Optional[str] = Field(None, max_length=500, description="Audio file URL or identifier")


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    meeting_date: Optional[datetime] = None
    duration: int = Field(1800, ge=1)
    audio_url: Optional[str] = None
    # Participants can be passed as strings or ParticipantCreate
    participants: Optional[List[str]] = Field(default_factory=list, description="List of participant names")
    transcript_raw: Optional[str] = Field(None, description="Raw transcript text formatted as 'Speaker|00:10|Text'")
    transcript_segments: Optional[List[TranscriptSegmentCreate]] = None
    summary_overview: Optional[str] = None
    summary_takeaways: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    action_items: Optional[List[ActionItemCreate]] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    meeting_date: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=1)
    audio_url: Optional[str] = None
    participants: Optional[List[str]] = None


class MeetingListItem(BaseModel):
    id: int
    title: str
    meeting_date: datetime
    duration: int
    audio_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse]
    transcript_segments_count: int
    action_items_count: int
    has_summary: bool
    topics: List[str]

    model_config = ConfigDict(from_attributes=True)


class MeetingDetailResponse(BaseModel):
    id: int
    title: str
    meeting_date: datetime
    duration: int
    audio_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse]
    transcript_segments: List[TranscriptSegmentResponse]
    summary: Optional[SummaryResponse] = None
    topics: List[TopicResponse]
    action_items: List[ActionItemResponse]

    model_config = ConfigDict(from_attributes=True)
