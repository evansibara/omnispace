import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { FullScreenSpinner } from "@/components/feedback/full-screen-spinner";
import NotFoundPage from "./NotFoundPage";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterTenantPage = lazy(() => import("@/features/auth/pages/RegisterTenantPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ProjectMatrixViewPage = lazy(() => import("@/features/projects/pages/ProjectMatrixViewPage"));
const ProjectDetailPage = lazy(() => import("@/features/projects/pages/ProjectDetailPage"));
const TeamManagementPage = lazy(() => import("@/features/team/pages/TeamManagementPage"));
const BillingPage = lazy(() => import("@/features/team/pages/BillingPage"));
const ClientPortalPage = lazy(() => import("@/features/portal/pages/ClientPortalPage"));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<FullScreenSpinner />}>{element}</Suspense>;
}

/**
 * Two protected route groups, deliberately separate per the brief's
 * "securely separate internal agency paths from external client portal
 * paths": INTERNAL_ROLES get the agency shell (dashboard/projects/
 * team/billing); CLIENT gets only /portal. Both groups share <AppShell/>
 * for the chrome, but <ProtectedRoute allowedRoles={...}> means a client
 * who guesses /projects gets redirected, not a blank page with leaked
 * navigation.
 *
 * Every leaf page is lazy-loaded so the auth bundle (the very first thing
 * a logged-out visitor downloads) doesn't carry the weight of the Kanban
 * board, charts, or the rest of the dashboard.
 */
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/register", element: withSuspense(<RegisterTenantPage />) },

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

  {
    element: <ProtectedRoute allowedRoles={["CLIENT"]} />,
    children: [
      {
        element: <AppShell />,
        children: [{ path: "/portal", element: withSuspense(<ClientPortalPage />) }],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
