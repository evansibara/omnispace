export interface UpcomingMilestone {
  projectId: string;
  projectTitle: string;
  deadline: string;
  completionRate: number;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalProjectsTrend: number;
  activeTasks: number;
  activeTasksTrend: number;
  averageCompletionRate: number;
  upcomingMilestones: UpcomingMilestone[];
}
