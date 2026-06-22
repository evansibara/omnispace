import { apiClient } from "@/config/axios";
import type {
  ApiResponse,
  CreateProjectPayload,
  PaginatedResult,
  PaginationParams,
  Project,
  ProjectListFilters,
  ProjectSummary,
  UpdateProjectPayload,
} from "@/types";
import type { ClientOption } from "../types";

export interface FetchProjectsParams extends PaginationParams, ProjectListFilters {}

/**
 * Every request here rides on the shared `apiClient` instance, which means
 * `withCredentials: true` and tenant scoping via the HttpOnly cookie are
 * automatic — the backend filters by `tenant_id` from the JWT, so the
 * frontend never needs to (and never should) pass a tenant identifier
 * explicitly.
 */
export async function fetchProjects(
  params: FetchProjectsParams,
): Promise<PaginatedResult<ProjectSummary>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResult<ProjectSummary>>>(
    "/projects",
    { params },
  );
  return data.data;
}

export async function fetchProjectById(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
  return data.data;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await apiClient.post<ApiResponse<Project>>("/projects", payload);
  return data.data;
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.patch<ApiResponse<Project>>(
    `/projects/${projectId}`,
    payload,
  );
  return data.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

/** Backs the "Client Assignment" dropdown in the create-project modal. */
export async function fetchClientOptions(): Promise<ClientOption[]> {
  const { data } = await apiClient.get<ApiResponse<ClientOption[]>>("/clients/options");
  return data.data;
}
