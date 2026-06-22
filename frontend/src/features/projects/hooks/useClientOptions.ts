import { useQuery } from "@tanstack/react-query";
import { fetchClientOptions } from "../api/projects.api";
import type { ApiError } from "@/types";
import type { ClientOption } from "../types";

export function useClientOptions() {
  return useQuery<ClientOption[], ApiError>({
    queryKey: ["clients", "options"],
    queryFn: fetchClientOptions,
    staleTime: 5 * 60 * 1000,
  });
}
