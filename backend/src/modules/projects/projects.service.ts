import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

const projectSummaryInclude = {
  client: { select: { id: true, companyName: true } },
  team: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
} satisfies Prisma.ProjectInclude;

const projectFullInclude = {
  client: {
    select: {
      id: true,
      companyName: true,
      contactUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
    },
  },
  projectManager: { select: { id: true, fullName: true, avatarUrl: true } },
  team: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
} satisfies Prisma.ProjectInclude;

type ProjectWithSummaryRelations = Prisma.ProjectGetPayload<{ include: typeof projectSummaryInclude }>;
type ProjectWithFullRelations = Prisma.ProjectGetPayload<{ include: typeof projectFullInclude }>;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser, query: QueryProjectsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;

    const where: Prisma.ProjectWhereInput = { tenantId: user.tenantId };

    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.status && query.status !== 'ALL') {
      where.status = query.status as ProjectStatus;
    }
    if (query.teamMemberId) {
      where.team = { some: { userId: query.teamMemberId } };
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: projectSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items.map((p: ProjectWithSummaryRelations) => this.toSummary(p)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId: user.tenantId },
      include: projectFullInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return this.toFull(project);
  }

  async create(user: AuthenticatedUser, dto: CreateProjectDto) {
    const client = await this.prisma.clientOrganization.findFirst({
      where: { id: dto.clientId, tenantId: user.tenantId },
    });
    if (!client) {
      throw new NotFoundException('Client not found.');
    }

    const project = await this.prisma.project.create({
      data: {
        tenantId: user.tenantId,
        title: dto.title,
        description: dto.description ?? '',
        clientId: dto.clientId,
        projectManagerId: user.id,
        targetDeadline: new Date(dto.targetDeadline),
      },
      include: projectFullInclude,
    });

    return this.toFull(project);
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateProjectDto) {
    await this.assertExists(user, id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.targetDeadline !== undefined ? { targetDeadline: new Date(dto.targetDeadline) } : {}),
      },
      include: projectFullInclude,
    });

    return this.toFull(project);
  }

  async remove(user: AuthenticatedUser, id: string): Promise<void> {
    await this.assertExists(user, id);
    // Cascade deletion of tasks/comments/reportJobs is enforced at the DB
    // level via onDelete: Cascade in schema.prisma.
    await this.prisma.project.delete({ where: { id } });
  }

  /** Recomputes and persists completionRate/taskCount(Done) for a project. */
  async recomputeCompletionStats(projectId: string): Promise<void> {
    const [taskCount, taskCountDone] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.count({ where: { projectId, status: 'DONE' } }),
    ]);
    const completionRate = taskCount > 0 ? Math.round((taskCountDone / taskCount) * 100) : 0;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { taskCount, taskCountDone, completionRate },
    });
  }

  /** Throws 404 if the project doesn't exist OR doesn't belong to the caller's tenant. */
  async assertExists(user: AuthenticatedUser, id: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
  }

  /** Used by the client portal: ensures a CLIENT caller owns the given project. */
  async assertClientOwnsProject(user: AuthenticatedUser, projectId: string): Promise<void> {
    const clientOrg = await this.prisma.clientOrganization.findUnique({
      where: { contactUserId: user.id },
      select: { id: true },
    });
    if (!clientOrg) {
      throw new ForbiddenException('No client organization is associated with this account.');
    }
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId: user.tenantId, clientId: clientOrg.id },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
  }

  private toSummary(project: ProjectWithSummaryRelations) {
    return {
      id: project.id,
      title: project.title,
      status: project.status,
      completionRate: project.completionRate,
      targetDeadline: project.targetDeadline.toISOString(),
      taskCount: project.taskCount,
      taskCountDone: project.taskCountDone,
      client: { id: project.client.id, companyName: project.client.companyName },
      team: project.team.map((t: ProjectWithSummaryRelations['team'][number]) => ({
        id: t.user.id,
        fullName: t.user.fullName,
        avatarUrl: t.user.avatarUrl,
      })),
    };
  }

  private toFull(project: ProjectWithFullRelations) {
    return {
      id: project.id,
      tenantId: project.tenantId,
      title: project.title,
      description: project.description,
      status: project.status,
      client: {
        id: project.client.id,
        companyName: project.client.companyName,
        contactUser: {
          id: project.client.contactUser.id,
          fullName: project.client.contactUser.fullName,
          email: project.client.contactUser.email,
          avatarUrl: project.client.contactUser.avatarUrl,
        },
      },
      projectManager: {
        id: project.projectManager.id,
        fullName: project.projectManager.fullName,
        avatarUrl: project.projectManager.avatarUrl,
      },
      team: project.team.map((t: ProjectWithFullRelations['team'][number]) => ({
        id: t.user.id,
        fullName: t.user.fullName,
        avatarUrl: t.user.avatarUrl,
      })),
      targetDeadline: project.targetDeadline.toISOString(),
      completionRate: project.completionRate,
      taskCount: project.taskCount,
      taskCountDone: project.taskCountDone,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
