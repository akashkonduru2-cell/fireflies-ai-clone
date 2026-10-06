/**
 * Formats duration in seconds into human-readable format.
 * E.g., 1800 -> "30 mins", 3600 -> "1h 00m", 75 -> "1m 15s"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 mins";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
  }
  if (mins > 0 && secs > 0) {
    return `${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins} mins`;
  }
  return `${secs} secs`;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS format for audio players and transcripts.
 * E.g., 85 -> "01:25"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats ISO date string into readable meeting date.
 * E.g., "2026-10-06T14:30:00Z" -> "Oct 6, 2026 • 2:30 PM"
 */
export function formatMeetingDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates consistent avatar colors based on participant name.
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Gets initials from person's name. E.g. "Sarah Chen" -> "SC"
 */
export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
