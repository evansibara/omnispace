import { useQuery } from "@tanstack/react-query";
import { fetchMyPortalProject } from "../api/portal.api";
import type { ApiError, Project } from "@/types";

export function usePortalProject() {
  return useQuery<Project, ApiError>({
    queryKey: ["portal", "project"],
    queryFn: fetchMyPortalProject,
    staleTime: 30 * 1000,
  });
}
