import { Badge } from "@/components/ui";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types";

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; tone: "neutral" | "signal" | "done" | "medium" }> = {
  PLANNING: { label: "Planning", tone: "neutral" },
  ACTIVE: { label: "Active", tone: "signal" },
  ON_HOLD: { label: "On Hold", tone: "medium" },
  COMPLETED: { label: "Completed", tone: "done" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = PROJECT_STATUS_CONFIG[status];
  return <Badge tone={config.tone} dot>{config.label}</Badge>;
}

const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; tone: "high" | "medium" | "low" }> = {
  HIGH: { label: "High", tone: "high" },
  MEDIUM: { label: "Medium", tone: "medium" },
  LOW: { label: "Low", tone: "low" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = TASK_PRIORITY_CONFIG[priority];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; tone: "todo" | "progress" | "review" | "done" }> = {
  TODO: { label: "To Do", tone: "todo" },
  IN_PROGRESS: { label: "In Progress", tone: "progress" },
  IN_REVIEW: { label: "In Review", tone: "review" },
  DONE: { label: "Done", tone: "done" },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = TASK_STATUS_CONFIG[status];
  return <Badge tone={config.tone} dot>{config.label}</Badge>;
}
