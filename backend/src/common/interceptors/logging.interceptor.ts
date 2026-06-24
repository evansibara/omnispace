import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

/**
 * LoggingInterceptor
 *
 * Emits a structured log line for every incoming HTTP request, including:
 *   - HTTP method + URL
 *   - Authenticated user ID (if present)
 *   - Tenant ID (if present in the JWT payload)
 *   - Response status code
 *   - Request duration in milliseconds
 *
 * Example output:
 *   [HTTP] GET /api/v1/projects → 200 | 42ms | userId=abc tenantId=xyz
 *   [HTTP] POST /api/v1/auth/login → 401 | 12ms | anonymous
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url } = request;
    const user = (request as any).user as
      | { id?: string; tenantId?: string }
      | undefined;

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const status = response.statusCode;
          const identity = user?.id
            ? `userId=${user.id} tenantId=${user.tenantId ?? "?"}`
            : "anonymous";

          this.logger.log(
            `${method} ${url} → ${status} | ${duration}ms | ${identity}`,
          );
        },
        error: (err: { status?: number }) => {
          const duration = Date.now() - start;
          const status = err?.status ?? 500;
          const identity = user?.id
            ? `userId=${user.id} tenantId=${user.tenantId ?? "?"}`
            : "anonymous";

          this.logger.warn(
            `${method} ${url} → ${status} | ${duration}ms | ${identity}`,
          );
        },
      }),
    );
  }
}
