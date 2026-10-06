from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Full name of participant")
    email: Optional[str] = Field(None, max_length=255, description="Email address (optional)")


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)
