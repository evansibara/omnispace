/**
 * Core multi-tenant identity types.
 * Mirrors the backend's `tenant_id` / `role_id` claims carried in the JWT
 * (see PRD §3 Epic 1 — Multi-Tenant Architecture & Auth).
 */

/** Every role the platform recognizes. Kept as a union, not an enum,
 * so it serializes cleanly across the wire and matches Prisma string columns. */
export type UserRole =
  | "SUPER_ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER"
  | "CLIENT";

export const USER_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "PROJECT_MANAGER",
  "DEVELOPER",
  "CLIENT",
] as const;

/** Subscription state of the tenant organization (billing-adjacent). */
export type TenantPlan = "FREE" | "STARTER" | "AGENCY" | "ENTERPRISE";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  logoUrl: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  jobTitle: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Authenticated session payload — what `/auth/me` resolves to.
 * Note: no token field. The JWT lives only in an HttpOnly cookie and is
 * never readable from JavaScript (NFR — XSS mitigation). */
export interface Session {
  user: User;
  tenant: Tenant;
}

/** Convenience guards used by RBAC components and feature gating. */
export const INTERNAL_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "PROJECT_MANAGER",
  "DEVELOPER",
];

export function isInternalRole(role: UserRole): boolean {
  return INTERNAL_ROLES.includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return role === "CLIENT";
}

export function canManageProjects(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "PROJECT_MANAGER";
}
