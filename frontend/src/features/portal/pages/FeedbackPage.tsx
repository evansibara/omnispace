import { Topbar } from "@/layouts/Topbar";
import { FeedbackThread } from "../components/FeedbackThread";
import { usePortalProject } from "../hooks/usePortalProject";
import { Skeleton } from "@/components/ui";

export default function FeedbackPage() {
  const { data: project, isLoading, isError } = usePortalProject();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-6 h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6">
        <p className="text-sm text-priority-high">
          Couldn't load the feedback thread. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title="Feedback"
        description={`Leave questions or notes for the team on ${project.title}.`}
      />
      <div className="p-6 max-w-2xl">
        <FeedbackThread projectId={project.id} />
      </div>
    </>
  );
}