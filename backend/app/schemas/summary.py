from datetime import datetime
from typing import Optional, List, Union
import json
from pydantic import BaseModel, ConfigDict, Field, field_validator


class SummaryBase(BaseModel):
    overview: str = Field(..., min_length=1, description="Overview paragraph")
    key_takeaways: List[str] = Field(default_factory=list, description="List of bullet takeaways")


class SummaryCreate(BaseModel):
    overview: str = Field(..., min_length=1)
    key_takeaways: Union[List[str], str] = Field(default_factory=list)

    @field_validator("key_takeaways", mode="before")
    def ensure_takeaways_list(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [line.strip("-•* ").strip() for line in v.split("\n") if line.strip()]
        return []


class SummaryUpdate(BaseModel):
    overview: Optional[str] = None
    key_takeaways: Optional[List[str]] = None


class SummaryResponse(BaseModel):
    id: int
    meeting_id: int
    overview: str
    key_takeaways: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
