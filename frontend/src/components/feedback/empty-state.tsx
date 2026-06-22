import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Treats empty data as an invitation to act, not a dead end — per the
 * interface voice: explain what's missing and what to do about it. */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border-default)] p-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-100)]">
        <Icon className="h-5 w-5 text-[var(--color-text-muted)]" />
      </span>
      <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
