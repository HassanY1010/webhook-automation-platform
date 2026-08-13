import { Injectable } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';

@Injectable()
export class AdminService {
  async getSystemStats() {
    const [totalUsers, totalOrgs, totalBots, totalExecutions, failedExecutions] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.bot.count(),
      prisma.execution.count(),
      prisma.execution.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalUsers,
      totalOrgs,
      totalBots,
      totalExecutions,
      failedExecutions,
      successRate: totalExecutions ? (((totalExecutions - failedExecutions) / totalExecutions) * 100).toFixed(2) + '%' : '100%',
    };
  }

  async getFeatureFlags() {
    return prisma.featureFlag.findMany();
  }

  async toggleFeatureFlag(key: string, isEnabled: boolean) {
    return prisma.featureFlag.update({
      where: { key },
      data: { isEnabled },
    });
  }
}
