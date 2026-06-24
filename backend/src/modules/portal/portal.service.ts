import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Resolves the single project tied to the caller's client organization —
   * no :id param, inferred entirely from the session.
   */
  async getProjectForClient(user: AuthenticatedUser) {
    const clientOrg = await this.prisma.clientOrganization.findUnique({
      where: { contactUserId: user.id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (
      !clientOrg ||
      clientOrg.tenantId !== user.tenantId ||
      clientOrg.projects.length === 0
    ) {
      throw new NotFoundException(
        "No project is currently associated with your account.",
      );
    }

    return this.projectsService.findOne(user, clientOrg.projects[0].id);
  }
}
