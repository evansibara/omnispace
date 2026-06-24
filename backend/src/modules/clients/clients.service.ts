import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOptions(user: AuthenticatedUser) {
    const clients = await this.prisma.clientOrganization.findMany({
      where: { tenantId: user.tenantId },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    });
    return clients;
  }
}
