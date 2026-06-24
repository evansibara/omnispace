import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

/**
 * HealthController
 *
 * Provides a lightweight health-check endpoint at GET /health.
 * This endpoint is:
 *   - Public (no JWT auth required)
 *   - Used by Docker healthchecks, Nginx upstream probes, and load balancers
 *
 * For a more thorough health check (DB + Redis connectivity),
 * consider integrating @nestjs/terminus in the future.
 */
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check(): { status: string; timestamp: string; uptime: number } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
