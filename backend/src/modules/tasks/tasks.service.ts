import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { TaskStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";

const taskSelect = {
  id: true,
  tenantId: true,
  projectId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  position: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, fullName: true, avatarUrl: true } },
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAllForProject(user: AuthenticatedUser, projectId: string) {
    await this.projectsService.assertExists(user, projectId);

    const tasks = await this.prisma.task.findMany({
      where: { projectId, tenantId: user.tenantId },
      select: taskSelect,
      orderBy: [{ status: "asc" }, { position: "asc" }],
    });

    return tasks.map((t) => this.toDto(t));
  }

  async create(user: AuthenticatedUser, projectId: string, dto: CreateTaskDto) {
    await this.projectsService.assertExists(user, projectId);

    if (dto.assigneeId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: dto.assigneeId, tenantId: user.tenantId },
        select: { id: true },
      });
      if (!assignee) {
        throw new BadRequestException(
          "assigneeId does not refer to a valid user in this tenant.",
        );
      }
    }

    const todoCount = await this.prisma.task.count({
      where: { projectId, status: TaskStatus.TODO },
    });

    const task = await this.prisma.task.create({
      data: {
        tenantId: user.tenantId,
        projectId,
        title: dto.title,
        description: dto.description ?? "",
        priority: dto.priority,
        status: TaskStatus.TODO,
        position: todoCount,
        assigneeId: dto.assigneeId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      select: taskSelect,
    });

    await this.projectsService.recomputeCompletionStats(projectId);

    return this.toDto(task);
  }

  /**
   * Drag-and-drop endpoint. Must be fast and idempotent-safe: re-sequences
   * positions for every other task in the destination (and, if changed,
   * source) column server-side so positions never collide, regardless of
   * the raw `position` integer the client sent.
   */
  async updateStatus(
    user: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, tenantId: user.tenantId },
    });
    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    const statusChanged = task.status !== dto.status;
    const wasDone = task.status === TaskStatus.DONE;
    const willBeDone = dto.status === TaskStatus.DONE;

    const destinationSiblings = await this.prisma.task.findMany({
      where: {
        projectId: task.projectId,
        status: dto.status,
        id: { not: taskId },
      },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    const insertIndex = Math.min(
      Math.max(dto.position, 0),
      destinationSiblings.length,
    );
    const reordered = [...destinationSiblings];
    reordered.splice(insertIndex, 0, { id: taskId });

    const sourceSiblings = statusChanged
      ? await this.prisma.task.findMany({
          where: {
            projectId: task.projectId,
            status: task.status,
            id: { not: taskId },
          },
          orderBy: { position: "asc" },
          select: { id: true },
        })
      : [];

    await this.prisma.$transaction([
      ...reordered.map((t, index) =>
        this.prisma.task.update({
          where: { id: t.id },
          data:
            t.id === taskId
              ? { status: dto.status, position: index }
              : { position: index },
        }),
      ),
      ...sourceSiblings.map((t, index) =>
        this.prisma.task.update({
          where: { id: t.id },
          data: { position: index },
        }),
      ),
    ]);

    if (statusChanged && wasDone !== willBeDone) {
      await this.projectsService.recomputeCompletionStats(task.projectId);
    }

    const updated = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: taskSelect,
    });

    return this.toDto(updated);
  }

  private toDto(task: {
    id: string;
    tenantId: string;
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: string;
    dueDate: Date | null;
    position: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
    assignee: { id: string; fullName: string; avatarUrl: string | null } | null;
  }) {
    return {
      id: task.id,
      tenantId: task.tenantId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      position: task.position,
      commentCount: task.commentCount,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
