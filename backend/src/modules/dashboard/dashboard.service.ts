import { Injectable } from "@nestjs/common";
import { TaskStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";
import { DashboardMetrics } from "./dashboard-metrics.interface";

const TREND_WINDOW_DAYS = 30;
const UPCOMING_MILESTONES_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(user: AuthenticatedUser): Promise<DashboardMetrics> {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - TREND_WINDOW_DAYS);
    const prevWindowStart = new Date(windowStart);
    prevWindowStart.setDate(prevWindowStart.getDate() - TREND_WINDOW_DAYS);

    const [totalProjects, projectsThisWindow, projectsPrevWindow] =
      await Promise.all([
        this.prisma.project.count({ where: { tenantId: user.tenantId } }),
        this.prisma.project.count({
          where: {
            tenantId: user.tenantId,
            createdAt: { gte: windowStart, lte: now },
          },
        }),
        this.prisma.project.count({
          where: {
            tenantId: user.tenantId,
            createdAt: { gte: prevWindowStart, lt: windowStart },
          },
        }),
      ]);

    const taskWhereBase = {
      tenantId: user.tenantId,
      status: { not: TaskStatus.DONE },
      ...(user.role === UserRole.DEVELOPER ? { assigneeId: user.id } : {}),
    };

    const [activeTasks, tasksThisWindow, tasksPrevWindow] = await Promise.all([
      this.prisma.task.count({ where: taskWhereBase }),
      this.prisma.task.count({
        where: { ...taskWhereBase, createdAt: { gte: windowStart, lte: now } },
      }),
      this.prisma.task.count({
        where: {
          ...taskWhereBase,
          createdAt: { gte: prevWindowStart, lt: windowStart },
        },
      }),
    ]);

    const activeProjects = await this.prisma.project.findMany({
      where: { tenantId: user.tenantId, status: { not: "COMPLETED" } },
      select: { completionRate: true },
    });
    const averageCompletionRate = activeProjects.length
      ? Math.round(
          activeProjects.reduce(
            (sum: number, p: (typeof activeProjects)[number]) =>
              sum + p.completionRate,
            0,
          ) / activeProjects.length,
        )
      : 0;

    const upcomingProjects = await this.prisma.project.findMany({
      where: { tenantId: user.tenantId, status: { not: "COMPLETED" } },
      orderBy: { targetDeadline: "asc" },
      take: UPCOMING_MILESTONES_LIMIT,
      select: {
        id: true,
        title: true,
        targetDeadline: true,
        completionRate: true,
      },
    });

    return {
      totalProjects,
      totalProjectsTrend: this.percentChange(
        projectsThisWindow,
        projectsPrevWindow,
      ),
      activeTasks,
      activeTasksTrend: this.percentChange(tasksThisWindow, tasksPrevWindow),
      averageCompletionRate,
      upcomingMilestones: upcomingProjects.map(
        (p: (typeof upcomingProjects)[number]) => ({
          projectId: p.id,
          projectTitle: p.title,
          deadline: p.targetDeadline.toISOString(),
          completionRate: p.completionRate,
        }),
      ),
    };
  }

  private percentChange(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return Math.round(((current - previous) / previous) * 100);
  }
}
