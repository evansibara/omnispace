import { Controller, Get } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/jwt-payload.interface";
import { PROJECT_MANAGEMENT_ROLES } from "../../common/constants/roles.constants";
import { ClientsService } from "./clients.service";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get("options")
  @Roles(...PROJECT_MANAGEMENT_ROLES)
  async findOptions(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.clientsService.findOptions(user);
    return { message: "Client options retrieved", data };
  }
}
