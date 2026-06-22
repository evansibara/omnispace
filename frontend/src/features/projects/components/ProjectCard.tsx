import { Link } from "react-router-dom";
import { CalendarDays, ListChecks } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui";
import { AvatarStack } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProjectStatusBadge } from "@/components/common/status-badges";
import { formatDate, isOverdue } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "../types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const overdue = isOverdue(project.targetDeadline) && project.status !== "COMPLETED";

  return (
    <Link to={`/projects/${project.id}`} className="block focus-visible:outline-none">
      <Card className="h-full transition-shadow hover:shadow-[var(--shadow-popover)]">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-[var(--color-text-primary)]">
                {project.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                {project.client.companyName}
              </p>
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>

          <ProgressBar value={project.completionRate} label="Completion" className="mt-4" />

          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {project.taskCountDone}/{project.taskCount} tasks
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5",
                overdue && "font-medium text-[var(--color-priority-high)]",
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(project.targetDeadline)}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <AvatarStack people={project.team} />
        </CardFooter>
      </Card>
    </Link>
  );
}
