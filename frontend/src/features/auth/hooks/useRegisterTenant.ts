import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerTenantRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, Session } from "@/types";
import type { RegisterTenantPayload } from "../types";

export function useRegisterTenant() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation<Session, ApiError, RegisterTenantPayload>({
    mutationFn: registerTenantRequest,
    onSuccess: (session) => {
      setSession(session.user, session.tenant);
      queryClient.setQueryData(["session"], session);
      toast.success(`${session.tenant.name} is ready. Welcome to OmniSpace.`);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Could not create your organization.");
    },
  });
}
