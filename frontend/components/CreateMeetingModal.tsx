"use client";

import React, { useState } from "react";
import { X, Sparkles, FileText, Users, Clock, Calendar, CheckSquare, Loader2 } from "lucide-react";
import { CreateMeetingPayload } from "@/types";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMeetingPayload) => Promise<void>;
}

export function CreateMeetingModal({ isOpen, onClose, onSubmit }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [participantsText, setParticipantsText] = useState("Sarah Chen, Alex Rivera, David Kim");
  const [topicsText, setTopicsText] = useState("Product Strategy, Roadmap, Execution");
  const [rawTranscript, setRawTranscript] = useState("");
  const [summaryOverview, setSummaryOverview] = useState("");
  const [actionItemTask, setActionItemTask] = useState("");
  const [actionItemAssignee, setActionItemAssignee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsertSample = () => {
    setTitle("Q4 Cross-Functional Product Alignment");
    setDurationMinutes(30);
    setParticipantsText("Sarah Chen, Alex Rivera, David Kim, Priya Patel");
    setTopicsText("Architecture, User Onboarding, Release Goals");
    setSummaryOverview(
      "The product and engineering teams aligned on key technical deliverables for the upcoming quarter, prioritizing low-latency real-time transcripts and high-touch customer pilots."
    );
    setRawTranscript(
      `Sarah Chen|00:00|Welcome everyone. Let's align on our deliverables for the quarter.\nAlex Rivera|00:14|On backend infrastructure, our audio synchronization API is tested and ready.\nDavid Kim|00:28|Design mockups for the new meeting intelligence workspace are 100% complete.\nPriya Patel|00:45|I will run end-to-end integration tests on the SQLite database models today.\nSarah Chen|01:05|Excellent. Let's make sure our action items are tracked and assigned properly.`
    );
    setActionItemTask("Validate database indexes on transcript search queries");
    setActionItemAssignee("Priya Patel");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a meeting title.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const participants = participantsText
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const topics = topicsText
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const actionItems = actionItemTask.trim()
        ? [
            {
              task: actionItemTask.trim(),
              assignee: actionItemAssignee.trim() || "Unassigned",
              due_date: "Next Week",
              completed: false,
            },
          ]
        : [];

      const payload: CreateMeetingPayload = {
        title: title.trim(),
        meeting_date: new Date(meetingDate).toISOString(),
        duration: Math.max(1, durationMinutes * 60),
        participants,
        transcript_raw: rawTranscript.trim() || undefined,
        summary_overview: summaryOverview.trim() || undefined,
        summary_takeaways: summaryOverview.trim()
          ? [
              "Product milestones reviewed and scheduled.",
              "Action items assigned across key participants.",
            ]
          : undefined,
        topics: topics.length > 0 ? topics : undefined,
        action_items: actionItems.length > 0 ? actionItems : undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create meeting. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Meeting
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record meeting details, parse transcripts, and extract action items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Quick template filler */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill with sample meeting data</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Product Sync"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration (Minutes)</span>
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Participants (Comma separated)</span>
            </label>
            <input
              type="text"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder="e.g. Sarah Chen, Alex Rivera, David Kim"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Topics (Comma separated)
            </label>
            <input
              type="text"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder="e.g. Product Strategy, Roadmap, Execution"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Raw Transcript Parser */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Paste Transcript (Automatic Parser)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Format: Speaker|MM:SS|Text
              </span>
            </div>
            <textarea
              rows={4}
              value={rawTranscript}
              onChange={(e) => setRawTranscript(e.target.value)}
              placeholder={`Sarah Chen|00:10|Welcome everyone to the call.\nAlex Rivera|00:25|Thanks Sarah, let's talk about the roadmap.`}
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* AI Summary Overview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Meeting Overview / Summary</span>
            </label>
            <textarea
              rows={2}
              value={summaryOverview}
              onChange={(e) => setSummaryOverview(e.target.value)}
              placeholder="Brief summary of meeting discussion and decisions..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Initial Action Item */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Add Initial Action Item (Optional)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={actionItemTask}
                onChange={(e) => setActionItemTask(e.target.value)}
                placeholder="Task description"
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={actionItemAssignee}
                onChange={(e) => setActionItemAssignee(e.target.value)}
                placeholder="Assignee name"
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Meeting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
