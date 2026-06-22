import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";

interface RoleGateProps {
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Strips children entirely from the DOM (not just hides them) when the
 * current user's role isn't in `allow`. This is what the brief means by
 * "Data Isolation Constraints" for the Client Portal: a CLIENT session
 * must never even have the create/edit/delete buttons mounted, since a
 * hidden-but-present button is still inspectable in devtools and is not
 * a real isolation guarantee on its own (the backend's RolesGuard is the
 * real enforcement — this is the UI's matching presentation layer).
 */
export function RoleGate({ allow, children }: RoleGateProps) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !allow.includes(role)) return null;
  return <>{children}</>;
}
