export interface DashboardMetrics {
  totalProjects: number;
  totalProjectsTrend: number;
  activeTasks: number;
  activeTasksTrend: number;
  averageCompletionRate: number;
  upcomingMilestones: MilestoneSummary[];
}

export interface MilestoneSummary {
  projectId: string;
  projectTitle: string;
  deadline: string;
  completionRate: number;
}
