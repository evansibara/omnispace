import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { INTERNAL_ROLES, PROJECT_MANAGEMENT_ROLES } from '../../common/constants/roles.constants';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles(...INTERNAL_ROLES)
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryProjectsDto) {
    const data = await this.projectsService.findAll(user, query);
    return { message: 'Projects retrieved', data };
  }

  @Get(':id')
  @Roles(...INTERNAL_ROLES)
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const data = await this.projectsService.findOne(user, id);
    return { message: 'Project retrieved', data };
  }

  @Post()
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProjectDto) {
    const data = await this.projectsService.create(user, dto);
    return { message: 'Project created', data };
  }

  @Patch(':id')
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const data = await this.projectsService.update(user, id, dto);
    return { message: 'Project updated', data };
  }

  @Delete(':id')
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.projectsService.remove(user, id);
    return { message: 'Project deleted', data: null };
  }
}
