from pydantic import BaseModel, ConfigDict, Field


class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class TopicCreate(TopicBase):
    pass


class TopicResponse(TopicBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)
