import { useQuery } from "@tanstack/react-query";
import { fetchReportJob } from "../api/portal.api";
import type { ApiError, ReportJob } from "@/types";

/** Polls a report job until it leaves QUEUED/PROCESSING. Mirrors the
 * backend's async-worker design: the request that starts the job returns
 * instantly, and the frontend just watches for completion. */
export function useReportJobStatus(jobId: string | null) {
  return useQuery<ReportJob, ApiError>({
    queryKey: ["reports", jobId],
    queryFn: () => fetchReportJob(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "READY" || status === "FAILED" ? false : 2500;
    },
  });
}
