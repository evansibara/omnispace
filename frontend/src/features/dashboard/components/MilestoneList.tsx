import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate, isOverdue } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MilestoneSummary } from "../types";

export function MilestoneList({ milestones }: { milestones: MilestoneSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming milestone deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No milestones due soon"
            description="Deadlines from active projects will surface here as they approach."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {milestones.map((m) => {
              const overdue = isOverdue(m.deadline);
              return (
                <li key={m.projectId}>
                  <Link
                    to={`/projects/${m.projectId}`}
                    className="block rounded-md border border-[var(--color-border-subtle)] p-3 transition-colors hover:border-[var(--color-signal-300)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {m.projectTitle}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-xs",
                          overdue ? "text-[var(--color-priority-high)]" : "text-[var(--color-text-muted)]",
                        )}
                      >
                        {formatDate(m.deadline)}
                      </span>
                    </div>
                    <ProgressBar value={m.completionRate} showValue={false} size="sm" className="mt-2.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
