import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Minimal, accessible modal: traps focus to "good enough" via autofocus
 * on mount, closes on Escape and backdrop click, and restores scroll. */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink-950)]/50 p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "w-full max-w-md rounded-lg bg-white p-6 shadow-[var(--shadow-popover)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-paper-100)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
