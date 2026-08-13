import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    this.client.connect().catch((err) => console.warn('Redis connection deferred:', err.message));
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {}
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {}
  }

  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<boolean> {
    try {
      const result = await this.client.set(`lock:${lockKey}`, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return true; // Fallback if redis offline
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.del(`lock:${lockKey}`);
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.quit();
    }
  }
}
