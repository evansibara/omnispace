import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTriggerReport } from "../hooks/useTriggerReport";
import { useReportJobStatus } from "../hooks/useReportJobStatus";

export function ReportTrigger({ projectId }: { projectId: string }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const triggerReport = useTriggerReport();
  const { data: job } = useReportJobStatus(jobId);

  const isWorking = job?.status === "QUEUED" || job?.status === "PROCESSING" || triggerReport.isPending;

  const handleClick = () => {
    triggerReport.mutate(projectId, {
      onSuccess: (createdJob) => setJobId(createdJob.id),
    });
  };

  if (job?.status === "READY" && job.downloadUrl) {
    return (
      <a
        href={job.downloadUrl}
        download
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-white px-3 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-paper-100)]",
        )}
      >
        <Download className="h-3.5 w-3.5" />
        Download monthly report
      </a>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} isLoading={isWorking} disabled={isWorking}>
      {!isWorking && <FileText className="h-3.5 w-3.5" />}
      {isWorking ? "Preparing report…" : "Generate monthly report"}
    </Button>
  );
}
