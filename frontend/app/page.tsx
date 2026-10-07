"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Clock,
  CheckSquare,
  Users,
  FileText,
  AlertCircle,
  RefreshCw,
  Search
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MeetingCard } from "@/components/MeetingCard";
import { MeetingSearch } from "@/components/MeetingSearch";
import { MeetingFilters } from "@/components/MeetingFilters";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { EditMeetingModal } from "@/components/EditMeetingModal";
import { DeleteMeetingModal } from "@/components/DeleteMeetingModal";
import { api } from "@/lib/api";
import { MeetingListItem, CreateMeetingPayload, UpdateMeetingPayload } from "@/types";
import { useToast } from "@/context/ToastContext";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const { showToast } = useToast();

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("newest");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingListItem | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<MeetingListItem | null>(null);

  // Fetch meetings with debounced search
  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMeetings({
        search: searchQuery.trim() || undefined,
        filter: currentFilter,
        sort: currentSort,
      });
      setMeetings(data);
    } catch (err: any) {
      console.error("Error fetching meetings:", err);
      setError(err?.message || "Failed to load meetings. Ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentFilter, currentSort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMeetings]);

  // CRUD Handlers
  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    try {
      await api.createMeeting(payload);
      showToast("Meeting created successfully!", "success");
      await fetchMeetings();
    } catch (err: any) {
      showToast(err?.message || "Failed to create meeting", "error");
      throw err;
    }
  };

  const handleUpdateMeeting = async (id: number, payload: UpdateMeetingPayload) => {
    try {
      await api.updateMeeting(id, payload);
      showToast("Meeting updated successfully!", "success");
      await fetchMeetings();
    } catch (err: any) {
      showToast(err?.message || "Failed to update meeting", "error");
      throw err;
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    try {
      await api.deleteMeeting(id);
      showToast("Meeting deleted successfully.", "success");
      await fetchMeetings();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete meeting", "error");
      throw err;
    }
  };

  // Metrics calculation
  const totalDurationSeconds = meetings.reduce((acc, m) => acc + (m.duration || 0), 0);
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.action_items_count || 0), 0);
  const totalTranscripts = meetings.reduce((acc, m) => acc + (m.transcript_segments_count || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Meeting Library"
          subtitle="Explore recorded sessions, interactive transcripts, and AI Takeaways"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Overview Metric Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Total Meetings</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {meetings.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Total Duration</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {formatDuration(totalDurationSeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Action Items</span>
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {totalActionItems}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Transcripts</span>
                <FileText className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {totalTranscripts}
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <MeetingSearch
                value={searchQuery}
                onChange={setSearchQuery}
                isLoading={isLoading}
              />
              <button
                onClick={() => setCreateModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>New Meeting</span>
              </button>
            </div>

            <MeetingFilters
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              currentSort={currentSort}
              onSortChange={setCurrentSort}
              totalMeetingsCount={meetings.length}
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchMeetings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 text-rose-800 dark:text-rose-200 text-xs font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Meeting Grid or Loading/Empty States */}
          {isLoading && meetings.length === 0 ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse"
                >
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-5/6" />
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/4" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : meetings.length > 0 ? (
            /* Meetings Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={(m) => setEditingMeeting(m)}
                  onDelete={(m) => setDeletingMeeting(m)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No meetings found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                {searchQuery
                  ? `No meetings matched "${searchQuery}". Try a different keyword or reset filters.`
                  : "Get started by recording or pasting your first meeting transcript."}
              </p>
              <div className="flex items-center justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentFilter("all");
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Meeting</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMeeting}
      />

      <EditMeetingModal
        isOpen={Boolean(editingMeeting)}
        meeting={editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSubmit={handleUpdateMeeting}
      />

      <DeleteMeetingModal
        isOpen={Boolean(deletingMeeting)}
        meeting={deletingMeeting}
        onClose={() => setDeletingMeeting(null)}
        onConfirm={handleDeleteMeeting}
      />
    </div>
  );
}
