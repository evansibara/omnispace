import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "./CreateTaskModal";
import { useProjectTasks } from "../hooks/useProjectTasks";
import { useUpdateTaskStatus } from "../hooks/useUpdateTaskStatus";
import { bucketTasksByStatus } from "../utils/board.utils";
import { KANBAN_COLUMNS } from "../types";
import { RoleGate } from "@/components/common/RoleGate";
import type { Task, TaskStatus } from "../types";

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useProjectTasks(projectId);
  const moveTask = useUpdateTaskStatus(projectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createTaskColumn, setCreateTaskColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const board = useMemo(() => bucketTasksByStatus(tasks ?? []), [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = (tasks ?? []).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskItem = (tasks ?? []).find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    // `over.id` is either a column id (dropped on empty column space) or
    // another task's id (dropped between/over cards) — resolve both to a
    // destination column + index.
    const overData = over.data.current as { type?: string; status?: TaskStatus } | undefined;
    const destinationStatus: TaskStatus =
      overData?.type === "Column" ? (over.id as TaskStatus) : (overData as { task: Task })?.task?.status ?? activeTaskItem.status;

    const destinationColumnTasks = board[destinationStatus];
    const overIndex = destinationColumnTasks.findIndex((t) => t.id === over.id);
    const newPosition = overIndex >= 0 ? overIndex : destinationColumnTasks.length;

    if (
      destinationStatus === activeTaskItem.status &&
      newPosition === activeTaskItem.position
    ) {
      return; // dropped back in the same spot — nothing to persist
    }

    moveTask.mutate({
      taskId: activeTaskItem.id,
      projectId,
      status: destinationStatus,
      position: newPosition,
    });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={board[col.id]}
              isLoading={isLoading}
              canAddTask={col.id === "TODO"}
              onAddTask={() => setCreateTaskColumn(col.id)}
            />
          ))}
        </div>

        <DragOverlay>{activeTask && <TaskCard task={activeTask} isOverlay />}</DragOverlay>
      </DndContext>

      <RoleGate allow={["SUPER_ADMIN", "PROJECT_MANAGER"]}>
        <CreateTaskModal
          projectId={projectId}
          open={createTaskColumn !== null}
          onClose={() => setCreateTaskColumn(null)}
        />
      </RoleGate>
    </>
  );
}
