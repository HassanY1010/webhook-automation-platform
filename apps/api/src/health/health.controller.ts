import { Controller, Get } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';

@Controller('health')
export class HealthController {
  @Get('live')
  getLiveness() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async getReadiness() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'UP',
        services: {
          database: 'UP',
          redis: 'UP',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'DOWN',
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
