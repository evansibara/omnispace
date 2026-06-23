import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { ReportsService } from './reports.service';

// No @Roles() restriction: both internal staff and CLIENT users may call
// these. Ownership for CLIENT callers is verified inside ReportsService.

@Controller('projects/:id/reports')
export class ProjectReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('monthly')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestMonthly(@CurrentUser() user: AuthenticatedUser, @Param('id') projectId: string) {
    const data = await this.reportsService.requestMonthlyReport(user, projectId);
    return { message: 'Report generation started', data };
  }
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':jobId')
  async getStatus(@CurrentUser() user: AuthenticatedUser, @Param('jobId') jobId: string) {
    const data = await this.reportsService.getStatus(user, jobId);
    return { message: 'Report job status retrieved', data };
  }
}
