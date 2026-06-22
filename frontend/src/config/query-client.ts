import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/types";

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = isApiError(error) ? error.statusCode : undefined;
        // Don't burn retries on auth/permission errors — they won't
        // resolve themselves, and 401 is already handled globally.
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
