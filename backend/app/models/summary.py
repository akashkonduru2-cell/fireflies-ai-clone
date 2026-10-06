import json
from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overview = Column(Text, nullable=False)
    # Stored as JSON string list of strings: ["Takeaway 1", "Takeaway 2"]
    key_takeaways = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")

    def get_takeaways_list(self) -> list[str]:
        if not self.key_takeaways:
            return []
        try:
            parsed = json.loads(self.key_takeaways)
            if isinstance(parsed, list):
                return parsed
            return [str(parsed)]
        except Exception:
            return [line.strip() for line in self.key_takeaways.split("\n") if line.strip()]

    def set_takeaways_list(self, takeaways: list[str]):
        self.key_takeaways = json.dumps(takeaways)
