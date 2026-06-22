import { useQuery } from "@tanstack/react-query";
import { fetchProjectById } from "../api/projects.api";
import type { ApiError, Project } from "@/types";

export function useProject(projectId: string | undefined) {
  return useQuery<Project, ApiError>({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProjectById(projectId as string),
    enabled: Boolean(projectId),
  });
}
