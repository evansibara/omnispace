import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/common/status-badges";
import { formatDate, isOverdue } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task.dueDate) && task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-md border border-[var(--color-border-subtle)] bg-white p-3 shadow-[var(--shadow-card)] transition-shadow active:cursor-grabbing",
        isDragging && "opacity-40",
        isOverlay && "rotate-1 shadow-[var(--shadow-popover)]",
      )}
    >
      <p className="text-sm font-medium leading-snug text-[var(--color-text-primary)]">
        {task.title}
      </p>

      <div className="mt-2.5 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.commentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <MessageSquare className="h-3 w-3" />
            {task.commentCount}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-xs",
            overdue ? "font-medium text-[var(--color-priority-high)]" : "text-[var(--color-text-muted)]",
          )}
        >
          {formatDate(task.dueDate)}
        </span>
        {task.assignee && <Avatar name={task.assignee.fullName} src={task.assignee.avatarUrl} size="sm" />}
      </div>
    </div>
  );
}
