import { apiClient } from "@/config/axios";
import type {
  ApiResponse,
  Comment,
  CreateCommentPayload,
  Project,
  ReportJob,
} from "@/types";

/** Client sessions are scoped server-side to their own project(s) only —
 * this endpoint never accepts a tenant or client id from the frontend. */
export async function fetchMyPortalProject(): Promise<Project> {
  const { data } = await apiClient.get<ApiResponse<Project>>("/portal/project");
  return data.data;
}

export async function fetchProjectComments(projectId: string): Promise<Comment[]> {
  const { data } = await apiClient.get<ApiResponse<Comment[]>>(
    `/projects/${projectId}/comments`,
  );
  return data.data;
}

export async function postComment(payload: CreateCommentPayload): Promise<Comment> {
  const { data } = await apiClient.post<ApiResponse<Comment>>("/comments", payload);
  return data.data;
}

/** Triggers the async PDF report worker (PRD Epic 4). Returns immediately
 * with a job record the UI can poll — generation happens off the request
 * thread, never blocking this call. */
export async function triggerMonthlyReport(projectId: string): Promise<ReportJob> {
  const { data } = await apiClient.post<ApiResponse<ReportJob>>(
    `/projects/${projectId}/reports/monthly`,
  );
  return data.data;
}

export async function fetchReportJob(jobId: string): Promise<ReportJob> {
  const { data } = await apiClient.get<ApiResponse<ReportJob>>(`/reports/${jobId}`);
  return data.data;
}
