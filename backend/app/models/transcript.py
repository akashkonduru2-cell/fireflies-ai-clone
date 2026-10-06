from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(100), nullable=False, index=True)
    start_time = Column(Float, nullable=False, index=True)  # in seconds e.g. 12.5
    end_time = Column(Float, nullable=False)    # in seconds e.g. 25.0
    text = Column(Text, nullable=False)

    meeting = relationship("Meeting", back_populates="transcript_segments")
