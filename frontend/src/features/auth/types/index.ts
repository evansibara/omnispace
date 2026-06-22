import type { Session } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterTenantPayload {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
}

/** Re-exported for call sites that only care about the auth flow shape. */
export type { Session };
