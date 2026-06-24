import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { ThrottlerStorageRedisService } from "./throttler-storage-redis.service";
import { REDIS_CLIENT } from "./redis.constants"; // <-- Diubah ke constants

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6379),
          password: config.get<string>("REDIS_PASSWORD") || undefined,
          maxRetriesPerRequest: null,
        });
      },
    },
    ThrottlerStorageRedisService,
  ],
  exports: [REDIS_CLIENT, ThrottlerStorageRedisService],
})
export class RedisModule {}
