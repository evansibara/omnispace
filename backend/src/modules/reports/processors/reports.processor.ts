import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { REPORTS_QUEUE } from '../reports.service';

interface GenerateReportJobData {
  reportJobId: string;
}

/**
 * Stubbed PDF generation worker. In production this would render an actual
 * PDF (e.g. with Puppeteer/PDFKit) and upload it to object storage, then
 * persist the real downloadUrl. Here it simulates the latency and writes a
 * placeholder URL so the frontend's polling flow can be exercised end-to-end.
 */
@Processor(REPORTS_QUEUE)
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<GenerateReportJobData>): Promise<void> {
    const { reportJobId } = job.data;

    try {
      await this.prisma.reportJob.update({
        where: { id: reportJobId },
        data: { status: 'PROCESSING' },
      });

      // Simulate PDF rendering time.
      await new Promise((resolve) => setTimeout(resolve, 4000));

      await this.prisma.reportJob.update({
        where: { id: reportJobId },
        data: {
          status: 'READY',
          downloadUrl: `/files/reports/${reportJobId}.pdf`,
        },
      });
    } catch (error) {
      this.logger.error(`Report job ${reportJobId} failed`, error instanceof Error ? error.stack : undefined);
      await this.prisma.reportJob.update({
        where: { id: reportJobId },
        data: { status: 'FAILED' },
      });
    }
  }
}
