import type { KanbanBoard, Task, TaskStatus } from "../types";
import { KANBAN_COLUMNS } from "../types";

/** Buckets a flat task list into the 4-column shape the board renders
 * directly, pre-sorted by `position` so drag-and-drop ordering survives
 * a refetch. */
export function bucketTasksByStatus(tasks: Task[]): KanbanBoard {
  const board = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = [];
    return acc;
  }, {} as KanbanBoard);

  for (const task of tasks) {
    board[task.status].push(task);
  }

  for (const status of Object.keys(board) as TaskStatus[]) {
    board[status].sort((a, b) => a.position - b.position);
  }

  return board;
}

export function flattenBoard(board: KanbanBoard): Task[] {
  return Object.values(board).flat();
}
