import { apiClient } from "@/config/axios";
import type { ApiResponse, User } from "@/types";

export async function fetchTenantStaff(): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<User[]>>("/team");
  return data.data;
}
