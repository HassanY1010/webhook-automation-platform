import { Injectable } from '@nestjs/common';
import { prisma, ExecutionStatus } from '@webhook-auto/database';

@Injectable()
export class AdminService {
  /** Platform-wide stats (admin only) */
  async getSystemStats() {
    const [totalUsers, totalOrgs, totalBots, totalExecutions, failedExecutions] =
      await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.bot.count(),
        prisma.execution.count(),
        prisma.execution.count({ where: { status: ExecutionStatus.FAILED } }),
      ]);

    return {
      totalUsers,
      totalOrgs,
      totalBots,
      totalExecutions,
      failedExecutions,
      successRate: totalExecutions
        ? (
            ((totalExecutions - failedExecutions) / totalExecutions) *
            100
          ).toFixed(2) + '%'
        : '100%',
    };
  }

  /**
   * Organization-scoped dashboard stats — real data, no mocks.
   * Used by the Dashboard overview page for the authenticated user's org.
   */
  async getOrgStats(organizationId: string) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalBots,
      activeBots,
      totalExecutions,
      successExecutions,
      failedExecutions,
      queuedExecutions,
      executionsLast24h,
      executionsLast7d,
      recentExecutions,
    ] = await Promise.all([
      prisma.bot.count({ where: { organizationId } }),
      prisma.bot.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.execution.count({ where: { organizationId } }),
      prisma.execution.count({
        where: { organizationId, status: ExecutionStatus.SUCCESS },
      }),
      prisma.execution.count({
        where: { organizationId, status: ExecutionStatus.FAILED },
      }),
      prisma.execution.count({
        where: {
          organizationId,
          status: { in: [ExecutionStatus.QUEUED, ExecutionStatus.RUNNING] },
        },
      }),
      prisma.execution.count({
        where: { organizationId, startedAt: { gte: last24h } },
      }),
      prisma.execution.count({
        where: { organizationId, startedAt: { gte: last7d } },
      }),
      prisma.execution.findMany({
        where: { organizationId },
        include: { bot: { select: { name: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    const successRate = totalExecutions
      ? ((successExecutions / totalExecutions) * 100).toFixed(1)
      : '100.0';

    return {
      bots: { total: totalBots, active: activeBots },
      executions: {
        total: totalExecutions,
        success: successExecutions,
        failed: failedExecutions,
        queued: queuedExecutions,
        last24h: executionsLast24h,
        last7d: executionsLast7d,
        successRate: `${successRate}%`,
      },
      recentActivity: recentExecutions,
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
