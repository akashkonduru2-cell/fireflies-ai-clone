"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Palette,
  Layers,
  Shield,
  Moon,
  Sun,
  Database,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { CreateMeetingPayload } from "@/types";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "profile" | "appearance" | "notifications" | "integrations" | "security"
  >("appearance");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    await api.createMeeting(payload);
    showToast("Meeting created!", "success");
  };

  const tabs = [
    { id: "appearance", label: "Appearance & Theme", icon: Palette },
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Layers },
    { id: "security", label: "Security & Retention", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Settings & Workspace Preferences"
          subtitle="Manage UI themes, storage preferences, and workspace integration hooks"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Tabs Sidebar */}
            <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Preferences
              </span>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      active
                        ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 lg:p-8">
              {activeTab === "appearance" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Appearance & Display Mode
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose between light mode or sleek high-contrast dark mode.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        if (theme === "dark") toggleTheme();
                      }}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                        theme === "light"
                          ? "border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/30"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Sun className="w-5 h-5 text-amber-500" />
                        {theme === "light" && (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        Light Mode
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Crisp white cards with indigo accents
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (theme === "light") toggleTheme();
                      }}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                        theme === "dark"
                          ? "border-purple-600 ring-2 ring-purple-600/20 bg-purple-950/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Moon className="w-5 h-5 text-purple-400" />
                        {theme === "dark" && (
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        Dark Mode
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Deep slate palette optimized for low light
                      </span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span>Persistent SQLite Storage</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      All meetings, transcript dialogue lines, action items, and AI summaries are persisted locally in SQLite via SQLAlchemy ORM.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-4 max-w-md">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    User Profile
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Akash K."
                        className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Fullstack Software Engineer"
                        className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                      User authentication is mocked for evaluation. No sign-in required.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4 max-w-md">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Notification Preferences
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Coming Soon
                    </span>
                    <p>
                      Email digests and Slack webhook notifications will be configurable in a future release.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "integrations" && (
                <div className="space-y-4 max-w-md">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Platform Integrations
                  </h3>
                  <div className="space-y-2 text-xs">
                    {["Google Meet Bot", "Zoom Audio Sync", "Slack Action Item Bot", "Notion Workspace Export"].map((integ, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {integ}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          Coming Soon
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4 max-w-md">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Security & Data Governance
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Local SQLite Security
                    </span>
                    <p>
                      All database queries utilize parameterized SQLAlchemy ORM statements with zero manual string concatenation. Cascading deletes protect referential integrity.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
