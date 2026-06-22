/**
 * Central type barrel.
 * `User`, `Tenant`, `UserRole`, `Project`, `Task`, and `ApiResponse` —
 * the interfaces called out explicitly in the brief — are all re-exported
 * here, alongside everything else the app needs. Strict mode is on
 * project-wide; nothing in this module (or anything importing from it)
 * may use `any`.
 */

export * from "./common";
export * from "./identity";
export * from "./project";
export * from "./task";
export * from "./portal";
