/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { withSuspense } from "./withSuspense";
import NotFoundPage from "./NotFoundPage";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterTenantPage = lazy(() => import("@/features/auth/pages/RegisterTenantPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ProjectMatrixViewPage = lazy(() => import("@/features/projects/pages/ProjectMatrixViewPage"));
const ProjectDetailPage = lazy(() => import("@/features/projects/pages/ProjectDetailPage"));
const TeamManagementPage = lazy(() => import("@/features/team/pages/TeamManagementPage"));
const BillingPage = lazy(() => import("@/features/team/pages/BillingPage"));
const ClientPortalPage = lazy(() => import("@/features/portal/pages/ClientPortalPage"));
// ↓ Halaman baru untuk CLIENT
const FeedbackPage = lazy(() => import("@/features/portal/pages/FeedbackPage"));
const ReportsPage = lazy(() => import("@/features/portal/pages/ReportsPage"));

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/register", element: withSuspense(<RegisterTenantPage />) },

  // ─── Internal routes (SUPER_ADMIN, PROJECT_MANAGER, DEVELOPER) ────────────
  {
    element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER", "DEVELOPER"]} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: withSuspense(<DashboardPage />) },
          { path: "/projects", element: withSuspense(<ProjectMatrixViewPage />) },
          { path: "/projects/:projectId", element: withSuspense(<ProjectDetailPage />) },
          {
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER"]} />,
            children: [
              { path: "/team", element: withSuspense(<TeamManagementPage />) },
              { path: "/billing", element: withSuspense(<BillingPage />) },
            ],
          },
        ],
      },
    ],
  },

  // ─── Client Portal routes (CLIENT only) ──────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["CLIENT"]} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/portal", element: withSuspense(<ClientPortalPage />) },
          { path: "/portal/feedback", element: withSuspense(<FeedbackPage />) },  // ← BARU
          { path: "/portal/reports", element: withSuspense(<ReportsPage />) },    // ← BARU
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);