import { NavLink } from "react-router-dom";
import { LogOut, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavForRole } from "./nav-config";
import { useAuthStore } from "@/store/useAuthStore";
import { useUiStore } from "@/store/useUiStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Avatar } from "@/components/ui";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const logout = useLogout();

  if (!user || !tenant) return null;

  const navItems = getNavForRole(user.role);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-[var(--color-ink-950)] text-[var(--color-text-inverse)] transition-[width] duration-200",
        isCollapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Tenant identity — the rail on the left edge signals "this org is
          active", echoing the same motif used on the auth screens. */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-ink-700)] px-4 py-4 tenant-rail">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-signal-500)] font-display text-xs font-bold">
          {tenant.name.charAt(0).toUpperCase()}
        </span>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{tenant.name}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-500)]">
              {tenant.plan}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/portal"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-signal-500)] text-white"
                      : "text-[var(--color-ink-500)] hover:bg-[var(--color-ink-800)] hover:text-white",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-ink-700)] p-2.5">
        <div className={cn("flex items-center gap-2.5 rounded-md px-2 py-2", !isCollapsed && "hover:bg-[var(--color-ink-800)]")}>
          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.fullName}</p>
              <p className="truncate text-[10px] text-[var(--color-ink-500)]">
                {user.role.replace("_", " ")}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logout.mutate()}
              aria-label="Log out"
              className="rounded-md p-1.5 text-[var(--color-ink-500)] hover:bg-[var(--color-ink-700)] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md py-1.5 text-[var(--color-ink-500)] hover:bg-[var(--color-ink-800)] hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft className={cn("h-3.5 w-3.5 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
