import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { JwtModule } from "@nestjs/jwt";
import Redis from "ioredis";

import { PrismaModule } from "./prisma/prisma.module";
import { REDIS_CLIENT } from "./redis/redis.constants";
import { RedisModule } from "./redis/redis.module"; // <-- Baris ini ditambahkan
import { ThrottlerStorageRedisService } from "./redis/throttler-storage-redis.service";

import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { TeamModule } from "./modules/team/team.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { PortalModule } from "./modules/portal/portal.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,

    // JwtModule is also registered inside AuthModule (where tokens are
    // signed). It's registered here too so the global JwtAuthGuard can
    // inject JwtService without importing AuthModule into every module.
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN", "7d") },
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        throttlers: [{ name: "default", ttl: 60000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6379),
          password: config.get<string>("REDIS_PASSWORD") || undefined,
        },
      }),
    }),

    AuthModule,
    DashboardModule,
    ProjectsModule,
    TasksModule,
    TeamModule,
    ClientsModule,
    PortalModule,
    CommentsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: rate-limit first, then authenticate, then authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    // Logging runs first (captures full duration), then ResponseInterceptor wraps the body.
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
