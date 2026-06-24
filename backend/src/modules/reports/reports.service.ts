import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ReportJob, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";
import { ReportJobDto } from "./dto/report-job.interface";

export const REPORTS_QUEUE = "reports";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    @InjectQueue(REPORTS_QUEUE) private readonly reportsQueue: Queue,
  ) {}

  async requestMonthlyReport(
    user: AuthenticatedUser,
    projectId: string,
  ): Promise<ReportJobDto> {
    await this.assertCanAccessProject(user, projectId);

    const periodLabel = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const job = await this.prisma.reportJob.create({
      data: {
        tenantId: user.tenantId,
        projectId,
        periodLabel,
        status: "QUEUED",
      },
    });

    // Fire-and-forget: the worker moves QUEUED -> PROCESSING -> READY/FAILED
    // asynchronously so this request never blocks on PDF generation.
    await this.reportsQueue.add(
      "generate-monthly-report",
      { reportJobId: job.id },
      { jobId: job.id, removeOnComplete: true, removeOnFail: true },
    );

    return this.toDto(job);
  }

  async getStatus(
    user: AuthenticatedUser,
    jobId: string,
  ): Promise<ReportJobDto> {
    const job = await this.prisma.reportJob.findFirst({
      where: { id: jobId, tenantId: user.tenantId },
    });
    if (!job) {
      throw new NotFoundException("Report job not found.");
    }

    if (user.role === UserRole.CLIENT) {
      await this.assertCanAccessProject(user, job.projectId);
    }

    return this.toDto(job);
  }

  private async assertCanAccessProject(
    user: AuthenticatedUser,
    projectId: string,
  ): Promise<void> {
    if (user.role === UserRole.CLIENT) {
      await this.projectsService.assertClientOwnsProject(user, projectId);
    } else {
      await this.projectsService.assertExists(user, projectId);
    }
  }

  private toDto(job: ReportJob): ReportJobDto {
    return {
      id: job.id,
      projectId: job.projectId,
      status: job.status,
      periodLabel: job.periodLabel,
      downloadUrl: job.downloadUrl,
      requestedAt: job.requestedAt.toISOString(),
    };
  }
}
