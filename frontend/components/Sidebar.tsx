"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Search,
  Settings,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Users,
  Plus
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  onOpenCreateModal?: () => void;
}

export function Sidebar({ onOpenCreateModal }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Meetings", href: "/meetings", icon: Users },
    { label: "Action Items", href: "/action-items", icon: CheckSquare },
    { label: "Global Search", href: "/search", icon: Search },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/" || href === "/meetings") {
      return pathname === "/" || pathname.startsWith("/meetings");
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu trigger */}
      <div className="md:hidden fixed top-3 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top: Logo & Nav */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo brand */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  FireNotes<span className="text-purple-600 dark:text-purple-400 font-mono text-xs uppercase px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60">AI</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Meeting Intelligence</span>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          {onOpenCreateModal && (
            <div className="px-4 pt-4 pb-2">
              <button
                onClick={() => {
                  onOpenCreateModal();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:shadow-lg active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>New Meeting</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-purple-50 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Workspace info card */}
          <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SQLite Connected</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Real-time meeting sync & interactive audio transcription active.
            </p>
          </div>
        </div>

        {/* Bottom Profile & Utilities */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {theme === "dark" ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {theme}
            </span>
          </button>

          {/* User profile card */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-500/30 group-hover:scale-105 transition-transform">
              AK
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                Akash K.
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Fullstack SDE Workspace
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
