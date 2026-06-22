import type { User } from "./identity";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
] as const;

/** Minimal client-org reference attached to a project (the external party
 * the agency is delivering to — distinct from the internal Tenant). */
export interface ProjectClient {
  id: string;
  companyName: string;
  contactUser: Pick<User, "id" | "fullName" | "email" | "avatarUrl">;
}

export interface Project {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  client: ProjectClient;
  projectManager: Pick<User, "id" | "fullName" | "avatarUrl">;
  team: Pick<User, "id" | "fullName" | "avatarUrl">[];
  targetDeadline: string;
  /** Pre-computed on the backend: (DONE tasks / total tasks) * 100. */
  completionRate: number;
  taskCount: number;
  taskCountDone: number;
  createdAt: string;
  updatedAt: string;
}

/** Slim shape used in list/matrix views to avoid over-fetching. */
export type ProjectSummary = Pick<
  Project,
  | "id"
  | "title"
  | "status"
  | "completionRate"
  | "targetDeadline"
  | "taskCount"
  | "taskCountDone"
> & {
  client: Pick<ProjectClient, "id" | "companyName">;
  team: Pick<User, "id" | "avatarUrl" | "fullName">[];
};

export interface CreateProjectPayload {
  title: string;
  description: string;
  clientId: string;
  targetDeadline: string;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  targetDeadline?: string;
}

export interface ProjectListFilters {
  search?: string;
  status?: ProjectStatus | "ALL";
  teamMemberId?: string;
}
