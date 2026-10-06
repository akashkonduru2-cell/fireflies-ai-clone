import json
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import func, desc, asc
from sqlalchemy.orm import Session

from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingListItem, MeetingDetailResponse
from app.schemas.summary import SummaryResponse
from app.services.transcript_service import parse_raw_transcript


def format_meeting_list_item(meeting: Meeting) -> MeetingListItem:
    """Helper to convert ORM Meeting to MeetingListItem schema"""
    return MeetingListItem(
        id=meeting.id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        duration=meeting.duration,
        audio_url=meeting.audio_url,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=meeting.participants,
        transcript_segments_count=len(meeting.transcript_segments),
        action_items_count=len(meeting.action_items),
        has_summary=meeting.summary is not None,
        topics=[t.name for t in meeting.topics]
    )


def format_meeting_detail(meeting: Meeting) -> MeetingDetailResponse:
    """Helper to convert ORM Meeting to MeetingDetailResponse schema"""
    summary_resp = None
    if meeting.summary:
        summary_resp = SummaryResponse(
            id=meeting.summary.id,
            meeting_id=meeting.summary.meeting_id,
            overview=meeting.summary.overview,
            key_takeaways=meeting.summary.get_takeaways_list(),
            created_at=meeting.summary.created_at,
            updated_at=meeting.summary.updated_at
        )

    return MeetingDetailResponse(
        id=meeting.id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        duration=meeting.duration,
        audio_url=meeting.audio_url,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=meeting.participants,
        transcript_segments=meeting.transcript_segments,
        summary=summary_resp,
        topics=meeting.topics,
        action_items=meeting.action_items
    )


def get_meetings(
    db: Session,
    search: Optional[str] = None,
    filter_date: Optional[str] = "all",
    sort: Optional[str] = "newest"
) -> List[MeetingListItem]:
    query = db.query(Meeting)

    # 1. Search filter: meeting title or participant name
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (func.lower(Meeting.title).like(term)) |
            (Meeting.participants.any(func.lower(Participant.name).like(term)))
        )

    # 2. Date filter
    now = datetime.utcnow()
    if filter_date == "today":
        start_of_today = datetime(now.year, now.month, now.day)
        end_of_today = start_of_today + timedelta(days=1)
        query = query.filter(Meeting.meeting_date >= start_of_today, Meeting.meeting_date < end_of_today)
    elif filter_date == "week":
        seven_days_ago = now - timedelta(days=7)
        query = query.filter(Meeting.meeting_date >= seven_days_ago)
    elif filter_date == "older":
        seven_days_ago = now - timedelta(days=7)
        query = query.filter(Meeting.meeting_date < seven_days_ago)

    # 3. Sorting
    if sort == "newest":
        query = query.order_by(desc(Meeting.meeting_date), desc(Meeting.id))
    elif sort == "oldest":
        query = query.order_by(asc(Meeting.meeting_date), asc(Meeting.id))
    elif sort == "longest":
        query = query.order_by(desc(Meeting.duration))
    elif sort == "shortest":
        query = query.order_by(asc(Meeting.duration))
    else:
        query = query.order_by(desc(Meeting.meeting_date))

    meetings = query.all()
    return [format_meeting_list_item(m) for m in meetings]


def get_meeting_by_id(db: Session, meeting_id: int) -> Optional[MeetingDetailResponse]:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return None
    return format_meeting_detail(meeting)


def create_meeting(db: Session, meeting_data: MeetingCreate) -> MeetingDetailResponse:
    meeting_date = meeting_data.meeting_date or datetime.utcnow()
    meeting = Meeting(
        title=meeting_data.title,
        meeting_date=meeting_date,
        duration=meeting_data.duration,
        audio_url=meeting_data.audio_url,
    )
    db.add(meeting)
    db.flush()  # gets meeting.id

    # 1. Add participants
    if meeting_data.participants:
        for p_name in meeting_data.participants:
            if isinstance(p_name, str) and p_name.strip():
                db.add(Participant(meeting_id=meeting.id, name=p_name.strip()))

    # 2. Add transcript segments (either raw text parsed or structured list)
    segments = []
    if meeting_data.transcript_raw and meeting_data.transcript_raw.strip():
        parsed = parse_raw_transcript(meeting_data.transcript_raw)
        segments.extend(parsed)
    elif meeting_data.transcript_segments:
        segments.extend(meeting_data.transcript_segments)

    for seg in segments:
        db.add(
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker=seg.speaker,
                start_time=seg.start_time,
                end_time=seg.end_time,
                text=seg.text
            )
        )

    # 3. Add summary if provided
    overview = meeting_data.summary_overview or "Meeting recording and transcript processed."
    takeaways = meeting_data.summary_takeaways or ["Discussion held and recorded."]
    summary_obj = Summary(
        meeting_id=meeting.id,
        overview=overview,
        key_takeaways=json.dumps(takeaways)
    )
    db.add(summary_obj)

    # 4. Add topics
    if meeting_data.topics:
        for t_name in meeting_data.topics:
            if t_name and t_name.strip():
                db.add(Topic(meeting_id=meeting.id, name=t_name.strip()))

    # 5. Add action items
    if meeting_data.action_items:
        for act in meeting_data.action_items:
            db.add(
                ActionItem(
                    meeting_id=meeting.id,
                    task=act.task,
                    assignee=act.assignee,
                    due_date=act.due_date,
                    completed=act.completed
                )
            )

    db.commit()
    db.refresh(meeting)
    return format_meeting_detail(meeting)


def update_meeting(db: Session, meeting_id: int, update_data: MeetingUpdate) -> Optional[MeetingDetailResponse]:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return None

    if update_data.title is not None:
        meeting.title = update_data.title
    if update_data.meeting_date is not None:
        meeting.meeting_date = update_data.meeting_date
    if update_data.duration is not None:
        meeting.duration = update_data.duration
    if update_data.audio_url is not None:
        meeting.audio_url = update_data.audio_url

    # Update participants list if provided
    if update_data.participants is not None:
        # Delete existing participants
        db.query(Participant).filter(Participant.meeting_id == meeting_id).delete()
        for p_name in update_data.participants:
            if isinstance(p_name, str) and p_name.strip():
                db.add(Participant(meeting_id=meeting.id, name=p_name.strip()))

    meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)
    return format_meeting_detail(meeting)


def delete_meeting(db: Session, meeting_id: int) -> bool:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return False

    db.delete(meeting)
    db.commit()
    return True
