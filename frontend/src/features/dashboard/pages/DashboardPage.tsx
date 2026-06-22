import { FolderKanban, ListTodo, TrendingUp } from "lucide-react";
import { Topbar } from "@/layouts/Topbar";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { MetricCard } from "../components/MetricCard";
import { MilestoneList } from "../components/MilestoneList";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPercent } from "@/lib/formatters";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: metrics, isLoading, isError } = useDashboardMetrics();

  return (
    <>
      <Topbar
        title={`Welcome back${user ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        description="Here's what's moving across your workspace."
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="p-6">
          <p className="text-sm text-[var(--color-priority-high)]">
            Couldn't load your metrics right now. Try refreshing the page.
          </p>
        </div>
      )}

      {metrics && (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Total projects"
              value={String(metrics.totalProjects)}
              icon={FolderKanban}
              trend={metrics.totalProjectsTrend}
              sparklineData={[4, 6, 5, 7, 8, 7, metrics.totalProjects]}
            />
            <MetricCard
              label="Active tasks"
              value={String(metrics.activeTasks)}
              icon={ListTodo}
              trend={metrics.activeTasksTrend}
              sparklineData={[12, 18, 14, 20, 22, 19, metrics.activeTasks]}
            />
            <MetricCard
              label="Avg. completion rate"
              value={formatPercent(metrics.averageCompletionRate)}
              icon={TrendingUp}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MilestoneList milestones={metrics.upcomingMilestones} />
          </div>
        </div>
      )}
    </>
  );
}
