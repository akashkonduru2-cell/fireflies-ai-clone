"use client";

import React from "react";
import { Filter, ArrowUpDown } from "lucide-react";

interface MeetingFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
  totalMeetingsCount: number;
}

export function MeetingFilters({
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
  totalMeetingsCount,
}: MeetingFiltersProps) {
  const filterOptions = [
    { id: "all", label: "All Meetings" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "older", label: "Older" },
  ];

  const sortOptions = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
    { id: "longest", label: "Longest Duration" },
    { id: "shortest", label: "Shortest Duration" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto text-xs">
        {filterOptions.map((opt) => {
          const active = currentFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                active
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200/50 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Sort selector & Count */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{totalMeetingsCount}</span> meetings
        </span>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            {sortOptions.map((sortOpt) => (
              <option
                key={sortOpt.id}
                value={sortOpt.id}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {sortOpt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
