import type { User } from "./identity";

/** A feedback-loop comment left by either a client or internal staff,
 * threaded under a project or a specific task/milestone. */
export interface Comment {
  id: string;
  projectId: string;
  taskId: string | null;
  author: Pick<User, "id" | "fullName" | "avatarUrl" | "role">;
  body: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  projectId: string;
  taskId?: string;
  body: string;
}

/** Status of the monthly PDF report background job. */
export type ReportJobStatus = "QUEUED" | "PROCESSING" | "READY" | "FAILED";

export interface ReportJob {
  id: string;
  projectId: string;
  status: ReportJobStatus;
  periodLabel: string;
  downloadUrl: string | null;
  requestedAt: string;
}
