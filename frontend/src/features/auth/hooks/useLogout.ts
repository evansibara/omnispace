import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      // Clear regardless of whether the server call succeeded — the user's
      // intent was to log out, and the cookie may already be invalid.
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}
