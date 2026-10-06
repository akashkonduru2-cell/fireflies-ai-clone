"use client";

import React from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

interface TranscriptSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchesCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClear: () => void;
}

export function TranscriptSearch({
  searchQuery,
  onSearchChange,
  matchesCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  onClear,
}: TranscriptSearchProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transcript dialog..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1 whitespace-nowrap">
            {matchesCount > 0
              ? `${currentMatchIndex + 1} of ${matchesCount}`
              : "0 matches"}
          </span>

          <button
            onClick={onPrevMatch}
            disabled={matchesCount === 0}
            className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Previous match"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onNextMatch}
            disabled={matchesCount === 0}
            className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Next match"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
