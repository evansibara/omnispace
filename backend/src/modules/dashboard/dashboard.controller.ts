import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { INTERNAL_ROLES } from '../../common/constants/roles.constants';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(...INTERNAL_ROLES)
  async getMetrics(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.dashboardService.getMetrics(user);
    return { message: 'Dashboard metrics retrieved', data };
  }
}
