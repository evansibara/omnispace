import { Topbar } from "@/layouts/Topbar";
import { ReportTrigger } from "../components/ReportTrigger";
import { ProgressTracker } from "../components/ProgressTracker";
import { usePortalProject } from "../hooks/usePortalProject";
import { Skeleton, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FileBarChart, Info } from "lucide-react";

export default function ReportsPage() {
  const { data: project, isLoading, isError } = usePortalProject();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-6 h-48 w-full rounded-lg" />
        <Skeleton className="mt-4 h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6">
        <p className="text-sm text-priority-high">
          Couldn't load your reports. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title="Reports"
        description={`Performance reports for ${project.title}.`}
        actions={<ReportTrigger projectId={project.id} />}
      />

      <div className="flex flex-col gap-6 p-6 max-w-2xl">
        <ProgressTracker project={project} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-signal-600" />
              Monthly Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-(--color-text-secondary)">
              Generate a PDF summary of this project's progress, milestone completions,
              and task breakdown for the current month.
            </p>

            <div className="flex items-start gap-2 rounded-md bg-paper-100 p-3 text-xs text-text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <p>
                Report generation runs in the background and may take a few seconds.
                The download button will appear automatically when ready.
              </p>
            </div>

            <div className="pt-1">
              <ReportTrigger projectId={project.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}