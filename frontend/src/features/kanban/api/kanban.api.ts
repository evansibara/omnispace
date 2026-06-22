import { apiClient } from "@/config/axios";
import type { ApiResponse, CreateTaskPayload, Task, UpdateTaskStatusPayload } from "@/types";

export async function fetchProjectTasks(projectId: string): Promise<Task[]> {
  const { data } = await apiClient.get<ApiResponse<Task[]>>(
    `/projects/${projectId}/tasks`,
  );
  return data.data;
}

export async function createTask(
  projectId: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.post<ApiResponse<Task>>(
    `/projects/${projectId}/tasks`,
    payload,
  );
  return data.data;
}

/** Matches PRD §4B: `PATCH /api/v1/tasks/:id/status` — accessible to
 * Developers so they can move their own work across the board. */
export async function updateTaskStatus(
  taskId: string,
  payload: UpdateTaskStatusPayload,
): Promise<Task> {
  const { data } = await apiClient.patch<ApiResponse<Task>>(
    `/tasks/${taskId}/status`,
    payload,
  );
  return data.data;
}
