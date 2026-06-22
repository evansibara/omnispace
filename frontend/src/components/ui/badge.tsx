import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--color-paper-100)] text-[var(--color-text-secondary)]",
        signal: "bg-[var(--color-signal-50)] text-[var(--color-signal-600)]",
        done: "bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]",
        progress: "bg-[var(--color-status-progress-bg)] text-[var(--color-status-progress)]",
        review: "bg-[var(--color-status-review-bg)] text-[var(--color-status-review)]",
        todo: "bg-[var(--color-status-todo-bg)] text-[var(--color-status-todo)]",
        high: "bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high)]",
        medium: "bg-[var(--color-priority-medium-bg)] text-[var(--color-priority-medium)]",
        low: "bg-[var(--color-priority-low-bg)] text-[var(--color-priority-low)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
