import type { User } from "./identity";

/** Kanban lifecycle — matches the PRD's 4-column board exactly. */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;

export interface Task {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Pick<User, "id" | "fullName" | "avatarUrl"> | null;
  dueDate: string | null;
  /** Manual ordering index within a column, used for drag-and-drop persistence. */
  position: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  /** New index within the destination column, sent so the backend can
   * persist order without a second round-trip. */
  position: number;
}

/** Board shape consumed directly by the Kanban UI: tasks pre-bucketed
 * by column so components never need to filter on every render. */
export type KanbanBoard = Record<TaskStatus, Task[]>;
