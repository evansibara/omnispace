import { ReportJobStatus } from "@prisma/client";

export interface ReportJobDto {
  id: string;
  projectId: string;
  status: ReportJobStatus;
  periodLabel: string;
  downloadUrl: string | null;
  requestedAt: string;
}
