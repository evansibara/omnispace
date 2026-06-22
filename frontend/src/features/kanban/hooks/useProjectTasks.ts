import { useQuery } from "@tanstack/react-query";
import { fetchProjectTasks } from "../api/kanban.api";
import type { ApiError, Task } from "@/types";

export function useProjectTasks(projectId: string) {
  return useQuery<Task[], ApiError>({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: () => fetchProjectTasks(projectId),
    staleTime: 15 * 1000,
  });
}
