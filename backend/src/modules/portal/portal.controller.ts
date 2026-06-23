import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('project')
  @Roles(UserRole.CLIENT)
  async getProject(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.portalService.getProjectForClient(user);
    return { message: 'Project retrieved', data };
  }
}
