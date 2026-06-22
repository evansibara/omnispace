import { useQuery } from "@tanstack/react-query";
import { fetchProjectComments } from "../api/portal.api";
import type { ApiError, Comment } from "@/types";

export function useProjectComments(projectId: string | undefined) {
  return useQuery<Comment[], ApiError>({
    queryKey: ["projects", projectId, "comments"],
    queryFn: () => fetchProjectComments(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 10 * 1000,
  });
}
