import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma, BotStatus, BotMode, SourceType } from '@webhook-auto/database';

@Injectable()
export class BotsService {
  async createBot(organizationId: string, data: any) {
    const publicKey = `bot_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const bot = await prisma.bot.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        mode: (data.mode as BotMode) || BotMode.LIVE,
        status: BotStatus.ACTIVE,
        publicKey,
        payloadSchema: data.payloadSchema || null,
        rules: data.rules || null,
        actions: data.actions,
      },
    });

    // Create initial Version 1
    await prisma.botVersion.create({
      data: {
        botId: bot.id,
        versionNumber: 1,
        payloadSchema: bot.payloadSchema,
        rules: bot.rules,
        actions: bot.actions,
      },
    });

    return bot;
  }

  async getBots(organizationId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [bots, total] = await Promise.all([
      prisma.bot.findMany({
        where: { organizationId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bot.count({ where: { organizationId } }),
    ]);

    return {
      bots,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBotById(organizationId: string, botId: string) {
    const bot = await prisma.bot.findFirst({
      where: { id: botId, organizationId },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        executions: { take: 10, orderBy: { startedAt: 'desc' } },
      },
    });

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }
    return bot;
  }

  async updateBot(organizationId: string, botId: string, data: any) {
    const existing = await this.getBotById(organizationId, botId);

    const nextVersion = existing.version + 1;

    const updated = await prisma.$transaction(async (tx) => {
      const bot = await tx.bot.update({
        where: { id: botId },
        data: {
          name: data.name ?? existing.name,
          description: data.description ?? existing.description,
          status: data.status ? (data.status as BotStatus) : existing.status,
          mode: data.mode ? (data.mode as BotMode) : existing.mode,
          payloadSchema: data.payloadSchema ?? existing.payloadSchema,
          rules: data.rules ?? existing.rules,
          actions: data.actions ?? existing.actions,
          version: nextVersion,
        },
      });

      await tx.botVersion.create({
        data: {
          botId: bot.id,
          versionNumber: nextVersion,
          payloadSchema: bot.payloadSchema,
          rules: bot.rules,
          actions: bot.actions,
        },
      });

      return bot;
    });

    return updated;
  }

  async toggleBotStatus(organizationId: string, botId: string, status: BotStatus) {
    await this.getBotById(organizationId, botId);
    return prisma.bot.update({
      where: { id: botId },
      data: { status },
    });
  }

  async rollbackVersion(organizationId: string, botId: string, targetVersion: number) {
    const bot = await this.getBotById(organizationId, botId);
    const target = await prisma.botVersion.findUnique({
      where: { botId_versionNumber: { botId, versionNumber: targetVersion } },
    });

    if (!target) {
      throw new NotFoundException(`Version ${targetVersion} not found for this bot`);
    }

    return this.updateBot(organizationId, botId, {
      payloadSchema: target.payloadSchema,
      rules: target.rules,
      actions: target.actions,
    });
  }

  async deleteBot(organizationId: string, botId: string) {
    await this.getBotById(organizationId, botId);
    await prisma.bot.delete({ where: { id: botId } });
    return { success: true };
  }
}
