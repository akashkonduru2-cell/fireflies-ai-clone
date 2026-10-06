"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Radio
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface MeetingPlayerProps {
  duration: number; // total duration in seconds
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function MeetingPlayer({
  duration,
  currentTime,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSeek,
  onSpeedChange,
}: MeetingPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  // Subtle acoustic audio engine using Web Audio API
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isPlaying && !isMuted && volume > 0) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        // Create oscillator for pleasant ambient conference hum / tone
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        
        // Gentle chord frequency (e.g. 220Hz harmonic A3)
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);

        // Low volume ambient presence
        const targetGain = Math.min(0.04, volume * 0.05);
        gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(targetGain, audioCtxRef.current.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();

        oscNodeRef.current = osc;
        gainNodeRef.current = gain;
      } catch {
        // Fallback gracefully if browser audio autoplay is restricted
      }
    } else {
      if (oscNodeRef.current) {
        try {
          oscNodeRef.current.stop();
          oscNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        oscNodeRef.current = null;
      }
    }

    return () => {
      if (oscNodeRef.current) {
        try {
          oscNodeRef.current.stop();
          oscNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        oscNodeRef.current = null;
      }
    };
  }, [isPlaying, isMuted, volume]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleSkip = (offsetSeconds: number) => {
    const nextTime = Math.min(Math.max(0, currentTime + offsetSeconds), duration);
    onSeek(nextTime);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800">
      {/* Top status bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying ? "bg-emerald-500" : "bg-slate-500"
              }`}
            />
          </span>
          <span className="font-medium text-slate-300">
            {isPlaying ? "Playing Meeting Audio" : "Playback Paused"}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-[11px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/60">
            Transcript Sync Active
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg px-2.5 py-1 border border-slate-700/60">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-transparent text-xs text-slate-200 font-mono focus:outline-hidden cursor-pointer"
          >
            {speedOptions.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-white">
                {s}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seekbar and Timeline */}
      <div className="space-y-1.5 mb-4">
        <div className="relative group flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-hidden"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progressPercent}%, #334155 ${progressPercent}%, #334155 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span className="text-purple-300 font-semibold">{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        {/* Left: Volume / Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hidden sm:block"
          />
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Skip -10s */}
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause Primary */}
          <button
            onClick={onPlayPause}
            className="p-3.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Skip +10s */}
          <button
            onClick={() => handleSkip(10)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
            title="Fast forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Audio Waveform Indicator */}
        <div className="flex items-center gap-1 h-5 px-2">
          {[40, 70, 30, 90, 60, 45, 80].map((height, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full bg-purple-500 transition-all duration-300 ${
                isPlaying ? "opacity-100" : "opacity-30"
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (height * (i % 2 === 0 ? 1 : 0.7)))}%` : "20%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
