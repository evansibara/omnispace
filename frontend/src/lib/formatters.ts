import { format, formatDistanceToNow, isPast } from "date-fns";

/** Format an ISO date string for display in task cards / tables. */
export function formatDate(iso: string | null, pattern = "d MMM yyyy"): string {
  if (!iso) return "—";
  return format(new Date(iso), pattern);
}

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return isPast(new Date(iso));
}

/** Clamp + round a completion ratio into a display-safe percentage. */
export function formatPercent(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  return `${Math.round(clamped)}%`;
}

/** Two-letter initials for avatar fallbacks, e.g. "Sarah Connor" -> "SC". */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}
