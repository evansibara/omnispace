import { apiClient } from "@/config/axios";
import type { ApiResponse } from "@/types";
import type { DashboardMetrics } from "../types";

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await apiClient.get<ApiResponse<DashboardMetrics>>(
    "/dashboard/metrics",
  );
  return data.data;
}
