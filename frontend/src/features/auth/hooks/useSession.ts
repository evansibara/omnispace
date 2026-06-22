import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchSessionRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, Session } from "@/types";

/**
 * The single source of truth for "is there a valid session". TanStack
 * Query owns the server-state lifecycle (caching, retry, staleness);
 * Zustand just mirrors the result so synchronous consumers (route guards,
 * sidebar) don't need to wire up `useQuery` everywhere.
 */
export function useSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const query = useQuery<Session, ApiError>({
    queryKey: ["session"],
    queryFn: fetchSessionRequest,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setSession(query.data.user, query.data.tenant);
    } else if (query.isError) {
      clearSession();
    }
  }, [query.data, query.isError, setSession, clearSession]);

  return query;
}
