"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  User,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Circle
} from "lucide-react";
import { ActionItem, ActionItemPayload } from "@/types";
import { ActionItemModal } from "./ActionItemModal";
import { getAvatarColor, getInitials } from "@/lib/utils";

interface ActionItemsProps {
  meetingId: number;
  actionItems: ActionItem[];
  onCreateActionItem: (data: ActionItemPayload) => Promise<void>;
  onUpdateActionItem: (id: number, data: Partial<ActionItemPayload>) => Promise<void>;
  onDeleteActionItem: (id: number) => Promise<void>;
}

export function ActionItems({
  actionItems,
  onCreateActionItem,
  onUpdateActionItem,
  onDeleteActionItem,
}: ActionItemsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ActionItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleToggleComplete = async (item: ActionItem) => {
    await onUpdateActionItem(item.id, { completed: !item.completed });
  };

  const handleModalSubmit = async (data: ActionItemPayload) => {
    if (selectedItem) {
      await onUpdateActionItem(selectedItem.id, data);
    } else {
      await onCreateActionItem(data);
    }
  };

  const completedCount = actionItems.filter((i) => i.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              Action Items
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {completedCount}/{actionItems.length} Done
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Tasks and deliverables assigned during the session
            </span>
          </div>
        </div>

        {/* Add action item trigger */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5">
        {actionItems && actionItems.length > 0 ? (
          actionItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${
                item.completed
                  ? "bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/50 opacity-75"
                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              {/* Checkbox & Task info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(item)}
                  className="mt-0.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                  title={item.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 hover:text-purple-500" />
                  )}
                </button>

                <div className="flex flex-col flex-1 min-w-0">
                  <span
                    className={`text-xs sm:text-sm font-medium leading-snug break-words ${
                      item.completed
                        ? "line-through text-slate-400 dark:text-slate-500"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.task}
                  </span>

                  {/* Assignee & Due Date tags */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-tr ${getAvatarColor(
                          item.assignee
                        )} text-white text-[8px] font-bold flex items-center justify-center`}
                      >
                        {getInitials(item.assignee)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {item.assignee}
                      </span>
                    </div>

                    {item.due_date && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.due_date}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit / Delete */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteActionItem(item.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              No action items recorded yet
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click "+ Add Task" to track deliverables from this meeting.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ActionItemModal
        isOpen={modalOpen}
        item={selectedItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
