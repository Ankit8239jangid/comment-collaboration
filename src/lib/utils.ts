import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns "5 min ago", "2 hours ago", "Yesterday", "Jun 12", etc. */
export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Returns "Today", "Yesterday", or "June 12" */
export function formatDateGroup(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return then.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/** Returns "10:42 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Build initials from a name */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Extract @Name tokens from text -> array of mentioned names */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([\w\s.]+)/g) || [];
  return matches.map((m) => m.slice(1).trim());
}

/** Strip trailing @partial token (used while typing to render the mention dropdown) */
export function getActiveMentionQuery(
  text: string,
  caret: number
): { query: string; start: number } | null {
  const before = text.slice(0, caret);
  const atIdx = before.lastIndexOf("@");
  if (atIdx === -1) return null;
  // The text between @ and caret must contain only word chars, spaces, dots
  const partial = before.slice(atIdx + 1);
  if (/[\n\r]/.test(partial)) return null;
  // Must immediately follow whitespace, start of string, or punctuation (allows @ after ( [ { etc.)
  const charBefore = before[atIdx - 1];
  if (
    charBefore &&
    !/\s/.test(charBefore) &&
    !/[([{<.,;:!?/@]/.test(charBefore)
  )
    return null;
  return { query: partial, start: atIdx };
}

/** Generate a short unique id */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Format file size in bytes to "2.4 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
