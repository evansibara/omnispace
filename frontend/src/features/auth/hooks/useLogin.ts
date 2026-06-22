import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, Session } from "@/types";
import type { LoginPayload } from "../types";

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation<Session, ApiError, LoginPayload>({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      setSession(session.user, session.tenant);
      queryClient.setQueryData(["session"], session);
      toast.success(`Welcome back, ${session.user.fullName.split(" ")[0]}`);

      const destination = session.user.role === "CLIENT" ? "/portal" : "/dashboard";
      navigate(destination, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Could not sign in. Check your credentials.");
    },
  });
}
