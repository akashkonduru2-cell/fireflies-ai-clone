"use client";

import React, { useState, useEffect } from "react";
import { X, CheckSquare, Calendar, User, Loader2 } from "lucide-react";
import { ActionItem, ActionItemPayload } from "@/types";

interface ActionItemModalProps {
  isOpen: boolean;
  item: ActionItem | null;
  onClose: () => void;
  onSubmit: (data: ActionItemPayload) => Promise<void>;
}

export function ActionItemModal({
  isOpen,
  item,
  onClose,
  onSubmit,
}: ActionItemModalProps) {
  const [task, setTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTask(item.task);
      setAssignee(item.assignee);
      setDueDate(item.due_date || "");
      setCompleted(item.completed);
    } else {
      setTask("");
      setAssignee("");
      setDueDate("");
      setCompleted(false);
    }
    setError(null);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("Task description is required.");
      return;
    }
    if (!assignee.trim()) {
      setError("Assignee is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        task: task.trim(),
        assignee: assignee.trim(),
        due_date: dueDate.trim() || undefined,
        completed,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save action item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {item ? "Edit Action Item" : "Add Action Item"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track deliverables with owners and timelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Description *
            </label>
            <textarea
              required
              rows={2}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Finalize Q4 roadmap slide deck"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assignee *</span>
            </label>
            <input
              type="text"
              required
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due Date</span>
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Oct 18, 2026 or Next Monday"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {item && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="itemCompleted"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="itemCompleted"
                className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{item ? "Update Task" : "Create Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
