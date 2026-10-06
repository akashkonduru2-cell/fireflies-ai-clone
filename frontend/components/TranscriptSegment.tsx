"use client";

import React from "react";
import { Play, Volume2 } from "lucide-react";
import { TranscriptSegment as ITranscriptSegment } from "@/types";
import { formatTime, getAvatarColor, getInitials } from "@/lib/utils";

interface TranscriptSegmentProps {
  segment: ITranscriptSegment;
  isActive: boolean;
  searchQuery: string;
  isCurrentSearchResult?: boolean;
  onSeek: (time: number) => void;
  segmentRef?: (el: HTMLDivElement | null) => void;
}

export function TranscriptSegment({
  segment,
  isActive,
  searchQuery,
  isCurrentSearchResult,
  onSeek,
  segmentRef,
}: TranscriptSegmentProps) {
  // Highlight query within text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className={`${
            isCurrentSearchResult
              ? "bg-amber-400 text-slate-950 font-semibold ring-2 ring-amber-500 rounded-xs"
              : "bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-amber-200 rounded-xs"
          } px-0.5`}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={segmentRef}
      onClick={() => onSeek(segment.start_time)}
      className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-purple-50/90 dark:bg-purple-950/30 border-purple-400/80 dark:border-purple-600 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/30"
          : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
      }`}
    >
      {/* Top Header: Speaker avatar, name, and timestamp badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getAvatarColor(
              segment.speaker
            )} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs`}
          >
            {getInitials(segment.speaker)}
          </div>
          <span
            className={`text-xs font-semibold ${
              isActive
                ? "text-purple-700 dark:text-purple-300 font-bold"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {segment.speaker}
          </span>
          {isActive && (
            <span className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>Speaking</span>
            </span>
          )}
        </div>

        {/* Timestamp button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSeek(segment.start_time);
          }}
          className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-medium flex items-center gap-1 transition-colors ${
            isActive
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60 group-hover:text-purple-600 dark:group-hover:text-purple-300"
          }`}
          title={`Seek to ${formatTime(segment.start_time)}`}
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{formatTime(segment.start_time)}</span>
        </button>
      </div>

      {/* Transcript Text */}
      <p
        className={`text-xs sm:text-sm leading-relaxed ${
          isActive
            ? "text-slate-900 dark:text-slate-100 font-medium"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {renderHighlightedText(segment.text, searchQuery)}
      </p>
    </div>
  );
}
