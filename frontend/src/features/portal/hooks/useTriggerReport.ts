import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { triggerMonthlyReport } from "../api/portal.api";
import type { ApiError, ReportJob } from "@/types";

/**
 * Fires the async PDF generation job and hands back a job id. This
 * mutation deliberately does NOT try to download a file directly — the
 * report is built by a background worker (PRD Epic 4), so the realistic
 * flow is: trigger -> poll job status -> show a download link once ready.
 * See `useReportJobStatus` for the polling half.
 */
export function useTriggerReport() {
  return useMutation<ReportJob, ApiError, string>({
    mutationFn: (projectId) => triggerMonthlyReport(projectId),
    onSuccess: () => {
      toast.success("Generating your report — this usually takes under a minute.");
    },
    onError: (error) => {
      toast.error(error.message || "Couldn't start the report.");
    },
  });
}
