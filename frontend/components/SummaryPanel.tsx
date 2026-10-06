"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle, Tag, Edit3, Save, X, Copy, Check } from "lucide-react";
import { Summary, Topic } from "@/types";

interface SummaryPanelProps {
  meetingId: number;
  summary: Summary | null;
  topics: Topic[];
  onUpdateSummary: (data: { overview: string; key_takeaways: string[] }) => Promise<void>;
}

export function SummaryPanel({
  summary,
  topics,
  onUpdateSummary,
}: SummaryPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [overview, setOverview] = useState(summary?.overview || "");
  const [takeawaysText, setTakeawaysText] = useState(
    summary?.key_takeaways?.join("\n") || ""
  );
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setOverview(summary?.overview || "");
    setTakeawaysText(summary?.key_takeaways?.join("\n") || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const takeawaysList = takeawaysText
        .split("\n")
        .map((t) => t.replace(/^[•\-*]\s*/, "").trim())
        .filter(Boolean);

      await onUpdateSummary({
        overview: overview.trim(),
        key_takeaways: takeawaysList,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySummary = () => {
    const textToCopy = `AI Summary Overview:\n${summary?.overview || ""}\n\nKey Takeaways:\n${
      summary?.key_takeaways?.map((t) => `• ${t}`).join("\n") || ""
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              AI Meeting Summary
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                GPT-4o Synthesized
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Automated executive digest and discussion outcomes
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopySummary}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy summary to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              title="Edit summary notes"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overview
            </label>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Takeaways (One per line)
            </label>
            <textarea
              rows={4}
              value={takeawaysText}
              onChange={(e) => setTakeawaysText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Summary"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-5">
          {/* Section 1: Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Executive Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-purple-50/40 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-100/60 dark:border-purple-900/30">
              {summary?.overview || "No overview recorded for this meeting."}
            </p>
          </div>

          {/* Section 2: Key Takeaways */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Key Takeaways
            </h4>
            {summary?.key_takeaways && summary.key_takeaways.length > 0 ? (
              <ul className="space-y-2">
                {summary.key_takeaways.map((takeaway, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No takeaways listed.</p>
            )}
          </div>

          {/* Section 3: Key Topics */}
          {topics && topics.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Discussed Topics</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
