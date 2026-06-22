import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { TaskCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "../types";

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  TODO: "var(--color-status-todo)",
  IN_PROGRESS: "var(--color-status-progress)",
  IN_REVIEW: "var(--color-status-review)",
  DONE: "var(--color-status-done)",
};

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  isLoading?: boolean;
  onAddTask?: () => void;
  canAddTask?: boolean;
}

export function KanbanColumn({ id, title, tasks, isLoading, onAddTask, canAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "Column", status: id } });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-lg bg-[var(--color-paper-100)]">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: COLUMN_ACCENT[id] }}
            aria-hidden="true"
          />
          <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <span className="font-mono text-xs text-[var(--color-text-muted)]">{tasks.length}</span>
        </div>
        {canAddTask && onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            aria-label={`Add task to ${title}`}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-text-primary)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "scrollbar-thin flex-1 space-y-2 overflow-y-auto px-2.5 pb-3 transition-colors",
          isOver && "bg-[var(--color-signal-50)]/60",
        )}
      >
        {isLoading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : (
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="rounded-md border border-dashed border-[var(--color-border-default)] py-6 text-center text-xs text-[var(--color-text-muted)]">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
}
