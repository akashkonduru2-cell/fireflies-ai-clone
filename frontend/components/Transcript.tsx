"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FileText, Plus, Upload, Check, AlertCircle } from "lucide-react";
import { TranscriptSegment as ITranscriptSegment } from "@/types";
import { TranscriptSegment } from "./TranscriptSegment";
import { TranscriptSearch } from "./TranscriptSearch";

interface TranscriptProps {
  meetingId: number;
  segments: ITranscriptSegment[];
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onUpdateTranscript?: (rawText: string) => Promise<void>;
}

export function Transcript({
  meetingId,
  segments,
  currentTime,
  isPlaying,
  onSeek,
  onUpdateTranscript,
}: TranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // References for auto-scrolling
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active segment based on current playback time
  const activeSegment = useMemo(() => {
    if (!segments || segments.length === 0) return null;

    // Find exact match
    const exact = segments.find(
      (s) => currentTime >= s.start_time && currentTime <= s.end_time
    );
    if (exact) return exact;

    // If between segments, select the most recent started segment before currentTime
    const past = segments.filter((s) => s.start_time <= currentTime);
    if (past.length > 0) {
      return past[past.length - 1];
    }

    return segments[0];
  }, [segments, currentTime]);

  // Find all segments matching the search query
  const matchingSegmentIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return segments
      .filter(
        (s) =>
          s.text.toLowerCase().includes(query) ||
          s.speaker.toLowerCase().includes(query)
      )
      .map((s) => s.id);
  }, [segments, searchQuery]);

  // Auto-scroll when active segment changes during playback
  useEffect(() => {
    if (isPlaying && activeSegment && segmentRefs.current) {
      const el = segmentRefs.current.get(activeSegment.id);
      if (el && containerRef.current) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeSegment?.id, isPlaying]);

  // Scroll to search match when navigating matches
  useEffect(() => {
    if (matchingSegmentIds.length > 0) {
      const targetId = matchingSegmentIds[currentMatchIndex];
      const el = segmentRefs.current.get(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentMatchIndex, matchingSegmentIds]);

  const handleNextMatch = () => {
    if (matchingSegmentIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchingSegmentIds.length);
  };

  const handlePrevMatch = () => {
    if (matchingSegmentIds.length === 0) return;
    setCurrentMatchIndex(
      (prev) => (prev - 1 + matchingSegmentIds.length) % matchingSegmentIds.length
    );
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentMatchIndex(0);
  };

  const handleSavePastedTranscript = async () => {
    if (!pastedText.trim() || !onUpdateTranscript) return;
    try {
      setIsUpdating(true);
      await onUpdateTranscript(pastedText);
      setShowPasteModal(false);
      setPastedText("");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col h-[650px]">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Meeting Transcript
            </h3>
            <span className="text-[11px] text-slate-400">
              {segments.length} segments • Click timestamp to seek audio
            </span>
          </div>
        </div>

        {onUpdateTranscript && (
          <button
            onClick={() => setShowPasteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all cursor-pointer"
            title="Import or replace transcript"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import/Edit</span>
          </button>
        )}
      </div>

      {/* Transcript Search Toolbar */}
      <div className="mb-3 shrink-0">
        <TranscriptSearch
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentMatchIndex(0);
          }}
          matchesCount={matchingSegmentIds.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          onClear={handleClearSearch}
        />
      </div>

      {/* Transcript Segments Scrollable Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-2.5 scroll-smooth"
      >
        {segments && segments.length > 0 ? (
          segments.map((seg) => {
            const isMatch = matchingSegmentIds.includes(seg.id);
            const isCurrentMatch =
              matchingSegmentIds[currentMatchIndex] === seg.id;
            const isActive = activeSegment?.id === seg.id;

            return (
              <TranscriptSegment
                key={seg.id}
                segment={seg}
                isActive={isActive}
                searchQuery={searchQuery}
                isCurrentSearchResult={isCurrentMatch}
                onSeek={onSeek}
                segmentRef={(el) => {
                  if (el) segmentRefs.current.set(seg.id, el);
                  else segmentRefs.current.delete(seg.id);
                }}
              />
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <FileText className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium">No transcript available</p>
            <p className="text-xs text-slate-500 mt-1">
              Paste audio dialog text or upload transcript segments.
            </p>
          </div>
        )}
      </div>

      {/* Paste / Replace Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Import / Replace Transcript
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Paste transcript formatted as <span className="font-mono text-purple-600 dark:text-purple-400">Speaker|MM:SS|Text</span>
            </p>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Sarah|00:00|Welcome everyone to the sprint review.\nJohn|00:15|We completed the new audio waveforms.\nSarah|00:30|Let's check the action items.`}
              className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePastedTranscript}
                disabled={isUpdating || !pastedText.trim()}
                className="px-4 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? "Parsing..." : "Save Transcript"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
