"use client";

import React from "react";
import { Search, X, Loader2 } from "lucide-react";

interface MeetingSearchProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function MeetingSearch({ value, onChange, isLoading }: MeetingSearchProps) {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or participant name..."
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-xs"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
        {value && !isLoading && (
          <button
            onClick={() => onChange("")}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
