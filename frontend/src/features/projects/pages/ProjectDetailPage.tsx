import { useParams } from "react-router-dom";
import { Topbar } from "@/layouts/Topbar";
import { Skeleton } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/common/status-badges";
import { AvatarStack } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDate } from "@/lib/formatters";
import { useProject } from "../hooks/useProject";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <Skeleton className="mt-6 h-[60vh] w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--color-priority-high)]">
          Couldn't load this project. It may have been removed, or you may not have access.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title={project.title}
        description={project.client.companyName}
        actions={<ProjectStatusBadge status={project.status} />}
      />

      <div className="border-b border-[var(--color-border-subtle)] bg-white px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-[var(--color-text-secondary)]">{project.description}</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Deadline</p>
              <p className="font-mono text-sm font-medium text-[var(--color-text-primary)]">
                {formatDate(project.targetDeadline)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Team</p>
              <AvatarStack people={project.team} />
            </div>
          </div>
        </div>
        <ProgressBar value={project.completionRate} label="Project completion" className="mt-4 max-w-md" />
      </div>

      <div className="h-[calc(100vh-12.5rem)] overflow-x-auto p-6">
        <KanbanBoard projectId={project.id} />
      </div>
    </>
  );
}
