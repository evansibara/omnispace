import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type FetchProjectsParams } from "../api/projects.api";
import type { ApiError, PaginatedResult, ProjectSummary } from "@/types";

/**
 * `keepPreviousData`-equivalent behavior (TanStack v5: `placeholderData`)
 * is intentionally enabled so paginating or changing a filter doesn't
 * flash a loading skeleton over an otherwise-stable table.
 */
export function useProjects(params: FetchProjectsParams) {
  return useQuery<PaginatedResult<ProjectSummary>, ApiError>({
    queryKey: ["projects", params],
    queryFn: () => fetchProjects(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}
