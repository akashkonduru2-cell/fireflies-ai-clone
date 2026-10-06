import json
from typing import Optional
from sqlalchemy.orm import Session
from app.models.summary import Summary
from app.schemas.summary import SummaryCreate, SummaryUpdate, SummaryResponse


def get_meeting_summary(db: Session, meeting_id: int) -> Optional[SummaryResponse]:
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        return None
    return SummaryResponse(
        id=summary.id,
        meeting_id=summary.meeting_id,
        overview=summary.overview,
        key_takeaways=summary.get_takeaways_list(),
        created_at=summary.created_at,
        updated_at=summary.updated_at
    )


def upsert_meeting_summary(db: Session, meeting_id: int, summary_data: SummaryUpdate) -> Optional[SummaryResponse]:
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        # Create new
        overview = summary_data.overview or "Meeting summary generated."
        takeaways = summary_data.key_takeaways or []
        summary = Summary(
            meeting_id=meeting_id,
            overview=overview,
            key_takeaways=json.dumps(takeaways)
        )
        db.add(summary)
    else:
        if summary_data.overview is not None:
            summary.overview = summary_data.overview
        if summary_data.key_takeaways is not None:
            summary.set_takeaways_list(summary_data.key_takeaways)

    db.commit()
    db.refresh(summary)
    return SummaryResponse(
        id=summary.id,
        meeting_id=summary.meeting_id,
        overview=summary.overview,
        key_takeaways=summary.get_takeaways_list(),
        created_at=summary.created_at,
        updated_at=summary.updated_at
    )
