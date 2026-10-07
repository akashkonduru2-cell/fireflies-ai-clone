"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  FileText,
  CheckSquare,
  Users,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { api } from "@/lib/api";
import { GlobalSearchData, CreateMeetingPayload } from "@/types";
import { formatTime, formatMeetingDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { showToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<GlobalSearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setData(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.search(term.trim());
      setData(res);
    } catch {
      showToast("Search failed", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    await api.createMeeting(payload);
    showToast("Meeting created!", "success");
  };

  const totalResults =
    (data?.meetings?.length || 0) +
    (data?.transcripts?.length || 0) +
    (data?.action_items?.length || 0) +
    (data?.topics?.length || 0);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Global Search"
          subtitle="Search across meeting titles, spoken dialogue, topics, and tasks"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Search Box */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dialogue, meeting titles, attendees, action items, topics..."
                className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>

          {/* Results Summary */}
          {data && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Found <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span> results for &ldquo;{data.query}&rdquo;
            </div>
          )}

          {/* Results Display */}
          {data ? (
            <div className="space-y-6">
              {/* 1. Meeting Matches */}
              {data.meetings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Matching Meetings ({data.meetings.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.meetings.map((m) => (
                      <Link
                        key={m.id}
                        href={`/meetings/${m.id}`}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs flex flex-col justify-between"
                      >
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
                          {m.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{formatMeetingDate(m.meeting_date)}</span>
                          <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                            View <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Transcript Dialog Matches */}
              {data.transcripts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Dialogue Matches ({data.transcripts.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {data.transcripts.map((t) => (
                      <Link
                        key={t.segment_id}
                        href={`/meetings/${t.meeting_id}`}
                        className="block p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {t.meeting_title}
                          </span>
                          <span className="font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {formatTime(t.start_time)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-900 dark:text-white mr-2">
                            {t.speaker}:
                          </span>
                          {t.text}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Action Items Matches */}
              {data.action_items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span>Action Item Matches ({data.action_items.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {data.action_items.map((act) => (
                      <Link
                        key={act.id}
                        href={`/meetings/${act.meeting_id}`}
                        className="block p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-500">
                            In {act.meeting_title}
                          </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            Assignee: {act.assignee}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                          {act.task}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Topics Matches */}
              {data.topics.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-pink-500" />
                    <span>Topic Matches ({data.topics.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.topics.map((top, idx) => (
                      <Link
                        key={idx}
                        href={`/meetings/${top.meeting_id}`}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-purple-500 transition-colors"
                      >
                        #{top.name} •{" "}
                        <span className="text-slate-400">{top.meeting_title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {totalResults === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    No results found
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for different keywords or check spelling.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Instant Global Workspace Search
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Type any keyword to query meeting minutes, spoken dialogue, action items, and topic tags simultaneously.
              </p>
            </div>
          )}
        </main>
      </div>

      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMeeting}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
