import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import type { UserRole } from "@/types";
import { FullScreenSpinner } from "@/components/feedback/full-screen-spinner";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Gate for everything that needs an authenticated session, with optional
 * role narrowing. Mount once per route group via React Router's nested
 * routes + <Outlet/>, e.g.:
 *
 *   <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
 *     <Route path="/portal" element={<ClientPortalPage />} />
 *   </Route>
 *
 * Auth state is resolved from `/auth/me` (the HttpOnly cookie), never from
 * anything stored client-side, so a stale Zustand snapshot can't grant
 * access the server wouldn't honor anyway.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { data: session, isLoading, isError } = useSession();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  if (isError || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    // Authenticated, but the wrong role for this section — send them to
    // the area their role actually owns rather than a dead end.
    const fallback = session.user.role === "CLIENT" ? "/portal" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
