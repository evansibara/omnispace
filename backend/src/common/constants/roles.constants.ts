import { UserRole } from "@prisma/client";

/** Every role except CLIENT — used for endpoints open to "internal" staff. */
export const INTERNAL_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.DEVELOPER,
];

/** Roles allowed to manage projects (create/update/delete). */
export const PROJECT_MANAGEMENT_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.PROJECT_MANAGER,
];
