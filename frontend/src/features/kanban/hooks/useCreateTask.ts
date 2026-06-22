import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "../api/kanban.api";
import type { ApiError, CreateTaskPayload, Task } from "@/types";

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiError, CreateTaskPayload>({
    mutationFn: (payload) => createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Task added to the board.");
    },
    onError: (error) => {
      toast.error(error.message || "Couldn't create the task.");
    },
  });
}
