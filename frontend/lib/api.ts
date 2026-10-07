import {
  MeetingListItem,
  MeetingDetail,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  TranscriptSegment,
  Summary,
  ActionItem,
  ActionItemPayload,
  GlobalSearchData,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error on non-json error responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // Meetings
  async getMeetings(params?: {
    search?: string;
    filter?: string;
    sort?: string;
  }): Promise<MeetingListItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.filter) query.set("filter", params.filter);
    if (params?.sort) query.set("sort", params.sort);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request<MeetingListItem[]>(`/api/meetings${queryString}`, { cache: "no-store" });
  },

  async getMeeting(id: number): Promise<MeetingDetail> {
    return request<MeetingDetail>(`/api/meetings/${id}`, { cache: "no-store" });
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<MeetingDetail> {
    return request<MeetingDetail>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateMeeting(id: number, payload: UpdateMeetingPayload): Promise<MeetingDetail> {
    return request<MeetingDetail>(`/api/meetings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteMeeting(id: number): Promise<void> {
    return request<void>(`/api/meetings/${id}`, {
      method: "DELETE",
    });
  },

  // Transcripts
  async getTranscript(meetingId: number): Promise<TranscriptSegment[]> {
    return request<TranscriptSegment[]>(`/api/meetings/${meetingId}/transcript`, { cache: "no-store" });
  },

  async updateTranscriptSegment(
    meetingId: number,
    segmentId: number,
    data: { text: string; speaker?: string }
  ): Promise<TranscriptSegment> {
    return request<TranscriptSegment>(`/api/meetings/${meetingId}/transcript/${segmentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async parseTranscript(meetingId: number, rawText: string): Promise<TranscriptSegment[]> {
    return request<TranscriptSegment[]>(`/api/meetings/${meetingId}/transcript/parse`, {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText }),
    });
  },

  // Summary
  async getSummary(meetingId: number): Promise<Summary> {
    return request<Summary>(`/api/meetings/${meetingId}/summary`, { cache: "no-store" });
  },

  async updateSummary(
    meetingId: number,
    payload: { overview?: string; key_takeaways?: string[] }
  ): Promise<Summary> {
    return request<Summary>(`/api/meetings/${meetingId}/summary`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Action Items
  async getAllActionItems(): Promise<ActionItem[]> {
    return request<ActionItem[]>("/api/action-items", { cache: "no-store" });
  },

  async getMeetingActionItems(meetingId: number): Promise<ActionItem[]> {
    return request<ActionItem[]>(`/api/meetings/${meetingId}/action-items`, { cache: "no-store" });
  },

  async createActionItem(meetingId: number, payload: ActionItemPayload): Promise<ActionItem> {
    return request<ActionItem>(`/api/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateActionItem(id: number, payload: Partial<ActionItemPayload>): Promise<ActionItem> {
    return request<ActionItem>(`/api/action-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteActionItem(id: number): Promise<void> {
    return request<void>(`/api/action-items/${id}`, {
      method: "DELETE",
    });
  },

  // Global Search
  async search(query: string): Promise<GlobalSearchData> {
    return request<GlobalSearchData>(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  },
};
