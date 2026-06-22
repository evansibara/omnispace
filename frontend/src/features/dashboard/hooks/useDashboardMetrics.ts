import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "../api/dashboard.api";
import type { ApiError } from "@/types";
import type { DashboardMetrics } from "../types";

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics, ApiError>({
    queryKey: ["dashboard", "metrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 60 * 1000,
  });
}
