export type {
  Task,
  TaskStatus,
  TaskPriority,
  KanbanBoard,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
} from "@/types";
export { TASK_STATUSES, TASK_PRIORITIES } from "@/types";

export interface ColumnConfig {
  id: import("@/types").TaskStatus;
  title: string;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];
