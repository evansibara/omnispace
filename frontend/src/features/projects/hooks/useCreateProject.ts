import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProject } from "../api/projects.api";
import { useUiStore } from "@/store/useUiStore";
import type { ApiError, CreateProjectPayload, Project } from "@/types";

export function useCreateProject() {
  const queryClient = useQueryClient();
  const closeProjectModal = useUiStore((s) => s.closeProjectModal);

  return useMutation<Project, ApiError, CreateProjectPayload>({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
      toast.success(`"${project.title}" was created.`);
      closeProjectModal();
    },
    onError: (error) => {
      toast.error(error.message || "Could not create the project.");
    },
  });
}
