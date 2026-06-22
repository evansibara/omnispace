import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-paper-50)] p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-signal-50)]">
        <Compass className="h-6 w-6 text-[var(--color-signal-600)]" />
      </span>
      <p className="font-mono text-sm text-[var(--color-text-muted)]">404</p>
      <h1 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
        This page doesn't exist
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        The link may be outdated, or the project you're looking for may have moved.
      </p>
      <Link
        to="/dashboard"
        className={cn(
          "mt-2 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-signal-500)] px-4 text-sm font-medium text-white hover:bg-[var(--color-signal-600)]",
        )}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
