import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { INTERNAL_ROLES, PROJECT_MANAGEMENT_ROLES } from '../../common/constants/roles.constants';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Controller('projects/:id/tasks')
export class ProjectTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles(...INTERNAL_ROLES)
  async findAll(@CurrentUser() user: AuthenticatedUser, @Param('id') projectId: string) {
    const data = await this.tasksService.findAllForProject(user, projectId);
    return { message: 'Tasks retrieved', data };
  }

  @Post()
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const data = await this.tasksService.create(user, projectId, dto);
    return { message: 'Task created', data };
  }
}

@Controller('tasks')
export class TaskStatusController {
  constructor(private readonly tasksService: TasksService) {}

  @Patch(':id/status')
  @Roles(...INTERNAL_ROLES)
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    const data = await this.tasksService.updateStatus(user, taskId, dto);
    return { message: 'Task status updated', data };
  }
}
