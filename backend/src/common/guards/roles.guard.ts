import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "@prisma/client";

/**
 * Enforces the strict role hierarchy: SUPER_ADMIN, PROJECT_MANAGER,
 * DEVELOPER, CLIENT. Routes without @Roles() are accessible to any
 * authenticated user. Must run AFTER JwtAuthGuard (depends on request.user).
 *
 * Ownership checks (e.g. a CLIENT only touching their own project) are
 * NOT handled here — role membership alone is insufficient for
 * /portal, /comments, /reports; those services additionally verify
 * resource ownership.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "You do not have permission to perform this action.",
      );
    }

    return true;
  }
}
