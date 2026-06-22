import { CheckCircle2, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatPercent } from "@/lib/formatters";
import type { Project } from "../types";

/**
 * The client-facing centerpiece: completion rendered exactly as the
 * formula in the brief states — (DONE tasks / total tasks) * 100 — with
 * no technical jargon (no "Kanban", no "tickets") since this view is
 * explicitly meant to hide internal tooling language from clients.
 */
export function ProgressTracker({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-[var(--color-ink-950)] px-6 py-8 text-[var(--color-text-inverse)]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-signal-300)]">
          Project health
        </p>
        <p className="mt-2 font-mono text-5xl font-semibold">
          {formatPercent(project.completionRate)}
        </p>
        <p className="mt-1 text-sm text-[var(--color-ink-500)]">complete, based on milestones delivered</p>
      </div>
      <CardContent className="pt-5">
        <ProgressBar value={project.completionRate} showValue={false} size="lg" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-status-done)]" />
            <div>
              <p className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                {project.taskCountDone}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Delivered</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[var(--color-text-muted)]" />
            <div>
              <p className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                {project.taskCount}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Total scope</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
