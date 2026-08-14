import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';
import { RedisService } from '../common/services/redis.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(RedisService) private redisService: RedisService) {}

  @Get('live')
  getLiveness() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('version')
  getVersion() {
    return {
      status: 'UP',
      version: '1.0.1-prod',
      deployedCommit: 'ad1491e',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness() {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    // ── PostgreSQL check ──────────────────────────────────────────────────────
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = 'UP';

      // Test Prisma ORM Model Queries
      try {
        const userCount = await prisma.user.count();
        results.userCount = userCount;
      } catch (uErr: any) {
        results.userQueryError = uErr.message;
        errors.push(`userQuery: ${uErr.message}`);
      }
    } catch (err: any) {
      results.database = 'DOWN';
      errors.push(`database: ${err.message}`);
    }

    // ── Redis check ───────────────────────────────────────────────────────────
    try {
      const probe = `health:probe:${Date.now()}`;
      const client = this.redisService.getClient();
      const pong = await client.ping();
      if (pong !== 'PONG') throw new Error(`Unexpected Redis ping response: ${pong}`);
      results.redis = 'UP';
    } catch (err: any) {
      results.redis = 'DOWN';
      errors.push(`redis: ${err.message}`);
    }

    const allUp = errors.length === 0;

    if (!allUp) {
      throw new ServiceUnavailableException({
        status: 'DOWN',
        services: results,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'UP',
      services: results,
      timestamp: new Date().toISOString(),
    };
  }
}
