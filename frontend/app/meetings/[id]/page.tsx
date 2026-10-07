"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MeetingPlayer } from "@/components/MeetingPlayer";
import { Transcript } from "@/components/Transcript";
import { SummaryPanel } from "@/components/SummaryPanel";
import { ActionItems } from "@/components/ActionItems";
import { EditMeetingModal } from "@/components/EditMeetingModal";
import { DeleteMeetingModal } from "@/components/DeleteMeetingModal";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { api } from "@/lib/api";
import {
  MeetingDetail,
  ActionItemPayload,
  UpdateMeetingPayload,
  CreateMeetingPayload,
} from "@/types";
import { formatDuration, formatMeetingDate, getAvatarColor, getInitials } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const meetingId = Number(params?.id);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch meeting details
  const fetchMeeting = useCallback(async () => {
    if (!meetingId || isNaN(meetingId)) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMeeting(meetingId);
      setMeeting(data);
    } catch (err: any) {
      console.error("Error fetching meeting:", err);
      setError(err?.message || "Failed to load meeting details.");
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  // Audio Playback simulation clock engine (works smoothly without external files)
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 100;
      playbackTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const maxDuration = meeting?.duration || 1800;
          const next = prev + (intervalMs / 1000) * playbackSpeed;
          if (next >= maxDuration) {
            setIsPlaying(false);
            return maxDuration;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, meeting?.duration]);

  // Player controls
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // Transcript update / parse
  const handleUpdateTranscript = async (rawText: string) => {
    try {
      const updatedSegments = await api.parseTranscript(meetingId, rawText);
      showToast("Transcript updated successfully!", "success");
      if (meeting) {
        setMeeting({ ...meeting, transcript_segments: updatedSegments });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to parse transcript", "error");
    }
  };

  // Individual transcript line update
  const handleUpdateSegmentText = async (segmentId: number, newText: string) => {
    try {
      const updatedSegment = await api.updateTranscriptSegment(meetingId, segmentId, {
        text: newText,
      });
      showToast("Transcript line updated!", "success");
      if (meeting) {
        setMeeting({
          ...meeting,
          transcript_segments: meeting.transcript_segments.map((seg) =>
            seg.id === segmentId ? updatedSegment : seg
          ),
        });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update transcript line", "error");
      throw err;
    }
  };

  // Summary update
  const handleUpdateSummary = async (data: {
    overview: string;
    key_takeaways: string[];
  }) => {
    try {
      const updatedSummary = await api.updateSummary(meetingId, data);
      showToast("Summary updated successfully!", "success");
      if (meeting) {
        setMeeting({ ...meeting, summary: updatedSummary });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update summary", "error");
    }
  };

  // Action Items CRUD
  const handleCreateActionItem = async (data: ActionItemPayload) => {
    try {
      const newItem = await api.createActionItem(meetingId, data);
      showToast("Action item added!", "success");
      if (meeting) {
        setMeeting({
          ...meeting,
          action_items: [...meeting.action_items, newItem],
        });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to add action item", "error");
    }
  };

  const handleUpdateActionItem = async (
    id: number,
    data: Partial<ActionItemPayload>
  ) => {
    try {
      const updated = await api.updateActionItem(id, data);
      showToast(
        data.completed !== undefined
          ? data.completed
            ? "Action item marked complete"
            : "Action item marked incomplete"
          : "Action item updated",
        "success"
      );
      if (meeting) {
        setMeeting({
          ...meeting,
          action_items: meeting.action_items.map((item) =>
            item.id === id ? updated : item
          ),
        });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update action item", "error");
    }
  };

  const handleDeleteActionItem = async (id: number) => {
    try {
      await api.deleteActionItem(id);
      showToast("Action item removed", "info");
      if (meeting) {
        setMeeting({
          ...meeting,
          action_items: meeting.action_items.filter((item) => item.id !== id),
        });
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete action item", "error");
    }
  };

  // Meeting Metadata CRUD
  const handleUpdateMeetingMetadata = async (
    id: number,
    payload: UpdateMeetingPayload
  ) => {
    try {
      const updated = await api.updateMeeting(id, payload);
      showToast("Meeting updated successfully!", "success");
      setMeeting(updated);
    } catch (err: any) {
      showToast(err?.message || "Failed to update meeting", "error");
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    try {
      await api.deleteMeeting(id);
      showToast("Meeting deleted successfully", "success");
      router.push("/");
    } catch (err: any) {
      showToast(err?.message || "Failed to delete meeting", "error");
    }
  };

  const handleCreateNewMeeting = async (payload: CreateMeetingPayload) => {
    const created = await api.createMeeting(payload);
    showToast("Meeting created!", "success");
    router.push(`/meetings/${created.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <span className="text-xs font-medium text-slate-500">
              Loading meeting intelligence workspace...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Meeting Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6">
            {error || "The requested meeting does not exist or has been removed."}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Meetings Library</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Meeting Workspace"
          subtitle={meeting.title}
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Back Navigation & Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library</span>
            </Link>

            {/* Top Action Buttons: Edit, Delete */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Meeting Title & Metadata Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {meeting.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>{formatMeetingDate(meeting.meeting_date)}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>{formatDuration(meeting.duration)}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{meeting.participants.length} Participants</span>
              </div>
            </div>

            {/* Participants avatars and names */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {meeting.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-tr ${getAvatarColor(
                      p.name
                    )} text-white text-[8px] font-bold flex items-center justify-center`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controlled Media Player (Top Audio Bar) */}
          <MeetingPlayer
            duration={meeting.duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSpeedChange={handleSpeedChange}
          />

          {/* Main 2-Column Meeting Intelligence Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: AI Summary & Action Items */}
            <div className="lg:col-span-6 space-y-6">
              <SummaryPanel
                meetingId={meeting.id}
                summary={meeting.summary}
                topics={meeting.topics}
                onUpdateSummary={handleUpdateSummary}
              />

              <ActionItems
                meetingId={meeting.id}
                actionItems={meeting.action_items}
                onCreateActionItem={handleCreateActionItem}
                onUpdateActionItem={handleUpdateActionItem}
                onDeleteActionItem={handleDeleteActionItem}
              />
            </div>

            {/* Right Column: Interactive Transcript with Search & Line Editing */}
            <div className="lg:col-span-6">
              <Transcript
                meetingId={meeting.id}
                segments={meeting.transcript_segments}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                onUpdateTranscript={handleUpdateTranscript}
                onUpdateSegmentText={handleUpdateSegmentText}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Edit Meeting Modal */}
      <EditMeetingModal
        isOpen={editModalOpen}
        meeting={meeting}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateMeetingMetadata}
      />

      {/* Delete Meeting Modal */}
      <DeleteMeetingModal
        isOpen={deleteModalOpen}
        meeting={meeting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteMeeting}
      />

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewMeeting}
      />
    </div>
  );
}
