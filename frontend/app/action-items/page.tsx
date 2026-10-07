"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Circle,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Trash2,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { api } from "@/lib/api";
import { ActionItem, CreateMeetingPayload } from "@/types";
import { getAvatarColor, getInitials } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function ActionItemsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllActionItems();
      setItems(data);
    } catch {
      showToast("Failed to load action items", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggle = async (item: ActionItem) => {
    try {
      const updated = await api.updateActionItem(item.id, {
        completed: !item.completed,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(
        updated.completed
          ? "Action item marked complete"
          : "Action item marked incomplete",
        "success"
      );
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteActionItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Action item deleted", "info");
    } catch {
      showToast("Failed to delete item", "error");
    }
  };

  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    await api.createMeeting(payload);
    showToast("Meeting created!", "success");
    await fetchItems();
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus === "pending" && item.completed) return false;
    if (filterStatus === "completed" && !item.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.task.toLowerCase().includes(q) ||
        item.assignee.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="All Action Items"
          subtitle="Consolidated tasks and commitments across all meetings"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Controls: Filter & Search */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "pending"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Pending ({items.filter((i) => !i.completed).length})
              </button>
              <button
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === "completed"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Completed ({items.filter((i) => i.completed).length})
              </button>
            </div>

            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or assignees..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Items List */}
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    item.completed
                      ? "bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggle(item)}
                      className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-purple-500" />
                      )}
                    </button>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-sm font-medium leading-snug break-words ${
                          item.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {item.task}
                      </span>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-4 h-4 rounded-full bg-gradient-to-tr ${getAvatarColor(
                              item.assignee
                            )} text-white text-[8px] font-bold flex items-center justify-center`}
                          >
                            {getInitials(item.assignee)}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.assignee}
                          </span>
                        </div>

                        {item.due_date && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.due_date}</span>
                            </div>
                          </>
                        )}

                        <span>•</span>
                        <Link
                          href={`/meetings/${item.meeting_id}`}
                          className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>View Meeting #{item.meeting_id}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No action items found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? "No tasks match your search filter."
                  : "All clear! No pending deliverables."}
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
