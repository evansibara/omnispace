import { Topbar } from "@/layouts/Topbar";
import { Skeleton } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/common/status-badges";
import { usePortalProject } from "../hooks/usePortalProject";
import { ProgressTracker } from "../components/ProgressTracker";
import { FeedbackThread } from "../components/FeedbackThread";
import { ReportTrigger } from "../components/ReportTrigger";
import { formatDate } from "@/lib/formatters";

/**
 * The entire client-facing surface. Note what's absent compared to the
 * internal Project Detail page: no Kanban board, no task-level technical
 * detail, no edit/delete affordances anywhere in this tree — by design,
 * not by hiding. Clients see outcomes, not the machinery that produced
 * them.
 */
export default function ClientPortalPage() {
  const { data: project, isLoading, isError } = usePortalProject();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-6 h-48 w-full rounded-lg" />
        <Skeleton className="mt-4 h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--color-priority-high)]">
          We couldn't load your project right now. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title={project.title}
        description={`Delivered by ${project.projectManager.fullName}`}
        actions={
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <ReportTrigger projectId={project.id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <ProgressTracker project={project} />
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-white p-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">Target completion</p>
            <p className="mt-1 font-mono text-lg font-semibold text-[var(--color-text-primary)]">
              {formatDate(project.targetDeadline, "EEEE, d MMMM yyyy")}
            </p>
          </div>
        </div>

        <FeedbackThread projectId={project.id} />
      </div>
    </>
  );
}
