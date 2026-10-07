"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  Sparkles,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight
} from "lucide-react";
import { MeetingListItem } from "@/types";
import { formatDuration, formatMeetingDate, getAvatarColor, getInitials } from "@/lib/utils";

interface MeetingCardProps {
  meeting: MeetingListItem;
  onEdit: (meeting: MeetingListItem) => void;
  onDelete: (meeting: MeetingListItem) => void;
}

export function MeetingCard({ meeting, onEdit, onDelete }: MeetingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState(false);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-600/60 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between">
      {/* Top Header: Title & Dropdown */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <Link
            href={`/meetings/${meeting.id}`}
            className="flex-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
          >
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {meeting.title}
            </h3>
          </Link>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(meeting);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Meeting</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(meeting);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Date and Duration metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatMeetingDate(meeting.meeting_date)}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(meeting.duration)}</span>
          </div>
        </div>

        {/* Topics chips */}
        {meeting.topics && meeting.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 items-center">
            {(expandedTopics ? meeting.topics : meeting.topics.slice(0, 3)).map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40"
              >
                #{topic}
              </span>
            ))}
            {meeting.topics.length > 3 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpandedTopics(!expandedTopics);
                }}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {expandedTopics ? "show less" : `+${meeting.topics.length - 3} more`}
              </button>
            )}
          </div>
        )}

        {/* Participants avatars & list */}
        <div className="mb-4">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Participants ({meeting.participants?.length || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {meeting.participants && meeting.participants.length > 0 ? (
              <>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {meeting.participants.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      title={p.name}
                      className={`inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-tr ${getAvatarColor(
                        p.name
                      )} text-white text-[10px] font-bold flex items-center justify-center`}
                    >
                      {getInitials(p.name)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-1 truncate max-w-[200px]">
                  {meeting.participants.map((p) => p.name).slice(0, 2).join(", ")}
                  {meeting.participants.length > 2 && ` +${meeting.participants.length - 2}`}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">No participants listed</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Segment count, Action Items, Summary, View Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Transcript dialogue count */}
          <div
            title={`${meeting.transcript_segments_count} dialogue lines`}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 text-[11px]"
          >
            <FileText className="w-3 h-3 text-purple-500" />
            <span>{meeting.transcript_segments_count} lines</span>
          </div>

          {/* Action items count */}
          <div
            title={`${meeting.action_items_count} action items`}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${
              meeting.action_items_count > 0
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40 font-medium"
                : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60"
            }`}
          >
            <CheckSquare className="w-3 h-3 text-emerald-500" />
            <span>{meeting.action_items_count} tasks</span>
          </div>

          {/* Summary badge */}
          {meeting.has_summary && (
            <div
              title="AI Executive Summary Available"
              className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-medium text-[11px] bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/40"
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Summary</span>
            </div>
          )}
        </div>

        {/* View meeting link */}
        <Link
          href={`/meetings/${meeting.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap ml-auto"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
