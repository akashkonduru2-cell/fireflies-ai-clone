import re
from typing import List, Tuple
from app.schemas.transcript import TranscriptSegmentCreate


def parse_timestamp_to_seconds(ts_str: str) -> float:
    """
    Parses timestamp strings into float seconds.
    Supports:
      - '01:25' -> 85.0
      - '01:25.5' -> 85.5
      - '01:25:30' -> 5130.0
      - '85' -> 85.0
    """
    ts_str = ts_str.strip()
    if not ts_str:
        return 0.0

    # If pure number
    try:
        return float(ts_str)
    except ValueError:
        pass

    parts = ts_str.split(":")
    try:
        if len(parts) == 2:
            minutes = float(parts[0])
            seconds = float(parts[1])
            return minutes * 60 + seconds
        elif len(parts) == 3:
            hours = float(parts[0])
            minutes = float(parts[1])
            seconds = float(parts[2])
            return hours * 3600 + minutes * 60 + seconds
    except ValueError:
        return 0.0

    return 0.0


def parse_raw_transcript(raw_text: str) -> List[TranscriptSegmentCreate]:
    """
    Parses user-entered or pasted transcript text into structured TranscriptSegmentCreate objects.
    Supported formats:
      1. Sarah|00:15|Welcome everyone to the call.
      2. Sarah|00:15-00:30|Welcome everyone to the call.
      3. [00:15] Sarah: Welcome everyone to the call.
      4. Sarah (00:15): Welcome everyone to the call.
      5. Sarah: Welcome everyone to the call. (auto-timestamped)
    """
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    parsed_segments: List[TranscriptSegmentCreate] = []

    current_time = 0.0

    for i, line in enumerate(lines):
        speaker = "Speaker"
        start_time = current_time
        end_time = current_time + 5.0
        text = line

        # Format 1 & 2: Pipe separated (Speaker|Timestamp|Text)
        if "|" in line:
            parts = line.split("|", 2)
            if len(parts) >= 3:
                speaker = parts[0].strip() or "Speaker"
                time_part = parts[1].strip()
                text = parts[2].strip()

                if "-" in time_part:
                    t_start, t_end = time_part.split("-", 1)
                    start_time = parse_timestamp_to_seconds(t_start)
                    end_time = parse_timestamp_to_seconds(t_end)
                else:
                    start_time = parse_timestamp_to_seconds(time_part)
                    # Duration estimated based on word count (approx 2.5 words per sec, min 4s)
                    words = len(text.split())
                    duration = max(3.0, words / 2.5)
                    end_time = start_time + duration
            elif len(parts) == 2:
                speaker = parts[0].strip()
                text = parts[1].strip()
                words = len(text.split())
                duration = max(3.0, words / 2.5)
                end_time = start_time + duration

        # Format 3: [00:15] Speaker: Text
        elif re.match(r"^\[([0-9:.]+)\]\s*([^:]+):\s*(.*)$", line):
            m = re.match(r"^\[([0-9:.]+)\]\s*([^:]+):\s*(.*)$", line)
            if m:
                start_time = parse_timestamp_to_seconds(m.group(1))
                speaker = m.group(2).strip()
                text = m.group(3).strip()
                words = len(text.split())
                duration = max(3.0, words / 2.5)
                end_time = start_time + duration

        # Format 4: Speaker (00:15): Text
        elif re.match(r"^([^(]+)\s*\(([0-9:.]+)\):\s*(.*)$", line):
            m = re.match(r"^([^(]+)\s*\(([0-9:.]+)\):\s*(.*)$", line)
            if m:
                speaker = m.group(1).strip()
                start_time = parse_timestamp_to_seconds(m.group(2))
                text = m.group(3).strip()
                words = len(text.split())
                duration = max(3.0, words / 2.5)
                end_time = start_time + duration

        # Format 5: Speaker: Text
        elif ":" in line and not line.startswith("http"):
            parts = line.split(":", 1)
            speaker = parts[0].strip()
            text = parts[1].strip()
            words = len(text.split())
            duration = max(3.0, words / 2.5)
            end_time = start_time + duration

        # Default fallback
        else:
            words = len(text.split())
            duration = max(3.0, words / 2.5)
            end_time = start_time + duration

        current_time = end_time + 1.0  # slight gap

        parsed_segments.append(
            TranscriptSegmentCreate(
                speaker=speaker,
                start_time=round(start_time, 2),
                end_time=round(end_time, 2),
                text=text
            )
        )

    # Adjust end_times so there's no inverted ranges and segments flow naturally
    for j in range(len(parsed_segments)):
        if j < len(parsed_segments) - 1:
            next_start = parsed_segments[j + 1].start_time
            if parsed_segments[j].end_time > next_start:
                parsed_segments[j].end_time = max(parsed_segments[j].start_time + 1.0, next_start)

    return parsed_segments
