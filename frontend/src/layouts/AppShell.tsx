import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "@/components/feedback/error-boundary";

/**
 * Shared chrome for every authenticated screen — internal staff and
 * external clients alike. The Sidebar itself decides what's visible per
 * role (see `nav-config.ts`); this shell just provides the scroll region
 * and the per-page error boundary so one broken widget can't take down
 * the whole shell.
 */
export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-paper-50)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
