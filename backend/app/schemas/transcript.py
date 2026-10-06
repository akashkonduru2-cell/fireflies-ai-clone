from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TranscriptSegmentBase(BaseModel):
    speaker: str = Field(..., min_length=1, max_length=100)
    start_time: float = Field(..., ge=0, description="Start timestamp in seconds")
    end_time: float = Field(..., ge=0, description="End timestamp in seconds")
    text: str = Field(..., min_length=1, description="Transcript segment content")


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)


class TranscriptParseRequest(BaseModel):
    """
    Accepts text in formats like:
    Speaker|00:15|Meeting note text here
    or
    00:15 - Speaker: Meeting note text here
    """
    raw_text: str = Field(..., description="Raw text transcript to parse")
