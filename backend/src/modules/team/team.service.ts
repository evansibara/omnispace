import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/types/jwt-payload.interface';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    const members = await this.prisma.user.findMany({
      where: { tenantId: user.tenantId, role: { not: UserRole.CLIENT } },
      orderBy: { fullName: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      tenantId: m.tenantId,
      fullName: m.fullName,
      email: m.email,
      role: m.role,
      avatarUrl: m.avatarUrl,
      jobTitle: m.jobTitle,
      isActive: m.isActive,
      createdAt: m.createdAt.toISOString(),
    }));
  }
}
