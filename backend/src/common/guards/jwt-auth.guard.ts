import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../types/jwt-payload.interface';

/**
 * Global guard: decodes the multi-tenant JWT from the HttpOnly cookie and
 * attaches `{ id, tenantId, role }` to `request.user`.
 *
 * Routes annotated with @Public() skip authentication entirely.
 * Any failure here MUST surface as exactly `statusCode: 401` in the
 * normalized error envelope (handled by the global HttpExceptionFilter).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const cookieName = this.configService.get<string>('COOKIE_NAME', 'access_token');
    const token = request.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Authentication required.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session.');
    }
  }
}
