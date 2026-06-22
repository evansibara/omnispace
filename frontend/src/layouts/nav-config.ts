import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CreditCard,
  KanbanSquare,
  MessageSquareText,
  FileBarChart,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for sidebar visibility per role (PRD §2 + Frontend
 * brief §2). Each role gets a deliberately different shape of nav, not the
 * same list with items grayed out — that's the actual isolation the brief
 * asks for, not just a visual suggestion of it.
 */
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", to: "/projects", icon: FolderKanban },
    { label: "Team", to: "/team", icon: Users },
    { label: "Billing", to: "/billing", icon: CreditCard },
  ],
  PROJECT_MANAGER: [
    { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", to: "/projects", icon: FolderKanban },
    { label: "Team", to: "/team", icon: Users },
    { label: "Billing", to: "/billing", icon: CreditCard },
  ],
  DEVELOPER: [
    { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", to: "/projects", icon: KanbanSquare },
  ],
  CLIENT: [
    { label: "Portal", to: "/portal", icon: LayoutDashboard },
    { label: "Feedback", to: "/portal/feedback", icon: MessageSquareText },
    { label: "Reports", to: "/portal/reports", icon: FileBarChart },
  ],
};

export function getNavForRole(role: UserRole): NavItem[] {
  return NAV_BY_ROLE[role];
}
