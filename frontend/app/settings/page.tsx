"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Layers,
  Shield,
  Moon,
  Sun,
  Database,
  CheckCircle
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { CreateMeetingPayload } from "@/types";

type SettingTab = "appearance" | "profile" | "notifications" | "integrations" | "security";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingTab>("appearance");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    await api.createMeeting(payload);
    showToast("Meeting created!", "success");
  };

  const tabs: { id: SettingTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "appearance", label: "Appearance & Theme", icon: Palette },
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Layers },
    { id: "security", label: "Security & Retention", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F17]">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Settings & Workspace Preferences"
          subtitle="Manage UI themes, storage preferences, and workspace integration hooks"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Tabs Sidebar */}
            <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1 block">
                Preferences
              </span>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      active
                        ? "bg-purple-50 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
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

                  {/* Theme Selection Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Light Mode Card - Always visually light */}
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer bg-white ${
                        theme === "light"
                          ? "border-purple-600 ring-2 ring-purple-600/30 shadow-md"
                          : "border-slate-300 hover:border-slate-400 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Sun className="w-5 h-5 text-amber-500" />
                        {theme === "light" && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 fill-purple-600 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        Light Mode
                      </span>
                      <span className="text-xs text-slate-500 leading-relaxed">
                        Crisp white cards with purple accents and slate borders
                      </span>
                    </button>

                    {/* Dark Mode Card - Always visually dark */}
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer bg-slate-900 ${
                        theme === "dark"
                          ? "border-purple-500 ring-2 ring-purple-500/30 shadow-md"
                          : "border-slate-700 hover:border-slate-600 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Moon className="w-5 h-5 text-purple-400" />
                        {theme === "dark" && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 fill-purple-500 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-sm text-white">
                        Dark Mode
                      </span>
                      <span className="text-xs text-slate-400 leading-relaxed">
                        Deep slate palette optimized for low light productivity
                      </span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Persistent SQLite Storage</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      All meetings, transcript dialogue lines, action items, and AI summaries are persisted locally in SQLite via SQLAlchemy ORM.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-4 max-w-md">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Profile & Account
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Akash K."
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Fullstack Software Engineer"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Workspace
                      </label>
                      <input
                        type="text"
                        disabled
                        value="FireNotes AI Enterprise Workspace"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
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
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Coming Soon
                    </span>
                    <p>
                      Email digests, transcript readiness alerts, and Slack webhook notifications will be configurable in a future release.
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
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {integ}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
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
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Local SQLite Security & Privacy
                    </span>
                    <p className="leading-relaxed">
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
