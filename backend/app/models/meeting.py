from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    meeting_date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    duration = Column(Integer, nullable=False, default=1800)  # duration in seconds (e.g. 1800 = 30m)
    audio_url = Column(String(500), nullable=True)  # optional sample audio file URL or identifier
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships with cascading deletes
    participants = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Participant.id"
    )
    transcript_segments = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.start_time"
    )
    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan"
    )
    topics = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Topic.id"
    )
    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="ActionItem.id"
    )
