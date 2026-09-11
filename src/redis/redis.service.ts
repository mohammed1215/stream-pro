import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private redis: Redis;
  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      url: config.get('UPSTASH_REDIS_REST_URL'),
      token: config.get('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  async recordViewWithThrottle(
    videoId: string,
    identifier: string,
    ttlSeconds: number = 21600,
  ) {
    const key = `view:${videoId}:${identifier}`;
    const result = await this.redis.set(key, '1', {
      ex: ttlSeconds,
      nx: true,
    });
    return result === 'OK';
  }
}
