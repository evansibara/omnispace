import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAllForProject(user: AuthenticatedUser, projectId: string) {
    await this.assertCanAccessProject(user, projectId);

    const comments = await this.prisma.comment.findMany({
      where: { projectId, tenantId: user.tenantId },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c: (typeof comments)[number]) => ({
      id: c.id,
      projectId: c.projectId,
      taskId: c.taskId,
      author: c.author,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async create(user: AuthenticatedUser, dto: CreateCommentDto) {
    // Never trust a client-supplied projectId blindly — re-validate
    // ownership/tenancy server-side regardless of caller role.
    await this.assertCanAccessProject(user, dto.projectId);

    if (dto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: dto.taskId, projectId: dto.projectId, tenantId: user.tenantId },
        select: { id: true },
      });
      if (!task) {
        throw new BadRequestException('taskId does not belong to the specified project.');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        tenantId: user.tenantId,
        projectId: dto.projectId,
        taskId: dto.taskId ?? null,
        authorId: user.id,
        body: dto.body,
      },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true, role: true } } },
    });

    if (dto.taskId) {
      await this.prisma.task.update({
        where: { id: dto.taskId },
        data: { commentCount: { increment: 1 } },
      });
    }

    return {
      id: comment.id,
      projectId: comment.projectId,
      taskId: comment.taskId,
      author: comment.author,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  private async assertCanAccessProject(user: AuthenticatedUser, projectId: string): Promise<void> {
    if (user.role === UserRole.CLIENT) {
      await this.projectsService.assertClientOwnsProject(user, projectId);
    } else {
      await this.projectsService.assertExists(user, projectId);
    }
  }
}
