import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { PROJECT_MANAGEMENT_ROLES } from '../../common/constants/roles.constants';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.teamService.findAll(user);
    return { message: 'Team members retrieved', data };
  }
}
