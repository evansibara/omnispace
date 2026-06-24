import { Inject, Injectable } from "@nestjs/common";
import { ThrottlerStorage } from "@nestjs/throttler";
import { ThrottlerStorageRecord } from "@nestjs/throttler/dist/throttler-storage-record.interface";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants"; // <-- Diubah ke constants

/**
 * Redis-backed implementation of ThrottlerStorage so rate-limit counters
 * survive across instances/restarts instead of living in process memory.
 */
@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const storageKey = `throttler:${key}`;

    const totalHits = await this.redis.incr(storageKey);
    if (totalHits === 1) {
      await this.redis.pexpire(storageKey, ttl);
    }
    const pttl = await this.redis.pttl(storageKey);

    return {
      totalHits,
      timeToExpire: Math.ceil(pttl / 1000),
    };
  }
}
