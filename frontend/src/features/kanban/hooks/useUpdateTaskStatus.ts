import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTaskStatus } from "../api/kanban.api";
import type { ApiError, Task, TaskStatus, UpdateTaskStatusPayload } from "@/types";

interface MoveTaskVariables {
  taskId: string;
  projectId: string;
  status: TaskStatus;
  position: number;
}

interface MutationContext {
  previousTasks: Task[] | undefined;
}

/**
 * Drives the Kanban drag-and-drop: the UI must update the instant a card
 * is dropped, with no spinner — so this mutation writes the new board
 * state into the query cache synchronously in `onMutate`, before the
 * network call resolves. If the server rejects the move, `onError` rolls
 * the cache back to the exact snapshot taken before the optimistic write.
 */
export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["projects", projectId, "tasks"];

  return useMutation<Task, ApiError, MoveTaskVariables, MutationContext>({
    mutationFn: ({ taskId, status, position }) => {
      const payload: UpdateTaskStatusPayload = { status, position };
      return updateTaskStatus(taskId, payload);
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (current) => {
        if (!current) return current;
        return current.map((task) =>
          task.id === variables.taskId
            ? { ...task, status: variables.status, position: variables.position }
            : task,
        );
      });

      return { previousTasks };
    },

    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error(error.message || "Couldn't move that task. Reverted.");
    },

    onSettled: () => {
      // Reconcile with the server's authoritative ordering once the
      // round-trip completes, success or not.
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
