export interface Participant {
  id: number;
  meeting_id: number;
  name: string;
  email?: string | null;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: string;
  start_time: number; // in seconds e.g. 15.5
  end_time: number;   // in seconds e.g. 28.0
  text: string;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string;
  key_takeaways: string[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  meeting_id: number;
  name: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  task: string;
  assignee: string;
  due_date?: string | null;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  meeting_date: string;
  duration: number; // in seconds
  audio_url?: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  transcript_segments_count: number;
  action_items_count: number;
  has_summary: boolean;
  topics: string[];
}

export interface MeetingDetail {
  id: number;
  title: string;
  meeting_date: string;
  duration: number;
  audio_url?: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  topics: Topic[];
  action_items: ActionItem[];
}

export interface CreateMeetingPayload {
  title: string;
  meeting_date?: string;
  duration?: number;
  audio_url?: string;
  participants?: string[];
  transcript_raw?: string;
  summary_overview?: string;
  summary_takeaways?: string[];
  topics?: string[];
  action_items?: {
    task: string;
    assignee: string;
    due_date?: string;
    completed?: boolean;
  }[];
}

export interface UpdateMeetingPayload {
  title?: string;
  meeting_date?: string;
  duration?: number;
  audio_url?: string;
  participants?: string[];
}

export interface ActionItemPayload {
  task: string;
  assignee: string;
  due_date?: string | null;
  completed?: boolean;
}

export interface TranscriptMatch {
  segment_id: number;
  meeting_id: number;
  meeting_title: string;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
}

export interface ActionItemMatch {
  id: number;
  meeting_id: number;
  meeting_title: string;
  task: string;
  assignee: string;
  due_date?: string | null;
  completed: boolean;
}

export interface GlobalSearchData {
  query: string;
  meetings: MeetingListItem[];
  transcripts: TranscriptMatch[];
  action_items: ActionItemMatch[];
  topics: {
    id: number;
    meeting_id: number;
    meeting_title: string;
    name: string;
  }[];
}
