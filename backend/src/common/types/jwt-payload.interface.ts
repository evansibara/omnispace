import { UserRole } from "@prisma/client";

/** Shape encoded inside the signed JWT (kept inside the HttpOnly cookie). */
export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  role: UserRole;
}

/** Shape attached to `request.user` after the auth guard runs. */
export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: UserRole;
}
