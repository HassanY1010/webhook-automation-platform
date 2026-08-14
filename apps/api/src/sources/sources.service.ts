import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma, BotStatus, SourceType } from '@webhook-auto/database';
import { generateSourceCredentials, encryptSecret } from '@webhook-auto/security';
import * as crypto from 'crypto';

@Injectable()
export class SourcesService {
  /**
   * Retrieves paginated list of Sources belonging strictly to the organization.
   */
  async getSources(
    organizationId: string,
    botId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };
    if (botId) where.botId = botId;

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        include: {
          bot: { select: { id: true, name: true, status: true, mode: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.source.count({ where }),
    ]);

    // Mask secretKey / do not return encrypted secret in list responses
    const sanitized = sources.map((s) => ({
      id: s.id,
      organizationId: s.organizationId,
      botId: s.botId,
      name: s.name,
      type: s.type,
      status: s.status,
      publicKey: s.publicKey,
      eventsCount: s.eventsCount,
      lastEventAt: s.lastEventAt,
      hasSecret: !!s.secretEncrypted,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      bot: s.bot,
    }));

    return {
      sources: sanitized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves single Source with strict tenant isolation.
   */
  async getSourceById(organizationId: string, sourceId: string) {
    const source = await prisma.source.findFirst({
      where: { id: sourceId, organizationId },
      include: {
        bot: { select: { id: true, name: true, status: true, mode: true } },
      },
    });

    if (!source) {
      throw new NotFoundException('Source not found or access denied');
    }

    return {
      id: source.id,
      organizationId: source.organizationId,
      botId: source.botId,
      name: source.name,
      type: source.type,
      status: source.status,
      publicKey: source.publicKey,
      eventsCount: source.eventsCount,
      lastEventAt: source.lastEventAt,
      hasSecret: !!source.secretEncrypted,
      config: source.config,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      bot: source.bot,
    };
  }

  /**
   * Creates a new Source with crypto-secure public key and encrypted HMAC secret.
   * Returns metadata and rawSecret once only for display upon creation.
   */
  async createSource(
    organizationId: string,
    data: {
      name: string;
      botId?: string | null;
      type?: SourceType;
      config?: any;
    },
  ) {
    // If botId provided, verify it belongs to this organization
    if (data.botId) {
      const bot = await prisma.bot.findFirst({
        where: { id: data.botId, organizationId },
      });
      if (!bot) {
        throw new BadRequestException(
          'Target Bot not found or does not belong to your organization',
        );
      }
    }

    const { publicKey, rawSecret, encryptedSecret } = generateSourceCredentials();

    const source = await prisma.source.create({
      data: {
        organizationId,
        botId: data.botId || null,
        name: data.name.trim(),
        type: data.type || SourceType.WEBHOOK,
        status: BotStatus.ACTIVE,
        publicKey,
        secretEncrypted: encryptedSecret,
        config: data.config || {},
      },
      include: {
        bot: { select: { id: true, name: true } },
      },
    });

    return {
      source: {
        id: source.id,
        organizationId: source.organizationId,
        botId: source.botId,
        name: source.name,
        type: source.type,
        status: source.status,
        publicKey: source.publicKey,
        eventsCount: source.eventsCount,
        createdAt: source.createdAt,
        bot: source.bot,
      },
      secret: rawSecret, // Revealed ONCE only upon creation
    };
  }

  /**
   * Updates an existing Source within the organization.
   */
  async updateSource(
    organizationId: string,
    sourceId: string,
    data: {
      name?: string;
      botId?: string | null;
      status?: BotStatus;
      config?: any;
    },
  ) {
    await this.getSourceById(organizationId, sourceId);

    if (data.botId) {
      const bot = await prisma.bot.findFirst({
        where: { id: data.botId, organizationId },
      });
      if (!bot) {
        throw new BadRequestException(
          'Target Bot not found or does not belong to your organization',
        );
      }
    }

    const updated = await prisma.source.update({
      where: { id: sourceId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        botId: data.botId !== undefined ? data.botId : undefined,
        status: data.status ? (data.status as BotStatus) : undefined,
        config: data.config !== undefined ? data.config : undefined,
      },
      include: {
        bot: { select: { id: true, name: true } },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      botId: updated.botId,
      name: updated.name,
      type: updated.type,
      status: updated.status,
      publicKey: updated.publicKey,
      eventsCount: updated.eventsCount,
      lastEventAt: updated.lastEventAt,
      hasSecret: !!updated.secretEncrypted,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      bot: updated.bot,
    };
  }

  /**
   * Toggles Source status between ACTIVE and PAUSED.
   */
  async toggleSourceStatus(organizationId: string, sourceId: string) {
    const existing = await this.getSourceById(organizationId, sourceId);
    const newStatus =
      existing.status === BotStatus.ACTIVE ? BotStatus.PAUSED : BotStatus.ACTIVE;

    const updated = await prisma.source.update({
      where: { id: sourceId },
      data: { status: newStatus },
      include: { bot: { select: { id: true, name: true } } },
    });

    return updated;
  }

  /**
   * Rotates HMAC signing secret for a Source.
   * Generates a new secret, encrypts with AES-256-GCM, and returns new raw secret once.
   */
  async rotateSourceSecret(organizationId: string, sourceId: string) {
    await this.getSourceById(organizationId, sourceId);

    const newRawSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const newEncryptedSecret = encryptSecret(newRawSecret);

    await prisma.source.update({
      where: { id: sourceId },
      data: { secretEncrypted: newEncryptedSecret },
    });

    return {
      success: true,
      message: 'Source secret rotated successfully',
      secret: newRawSecret, // Revealed ONCE only upon rotation
    };
  }

  /**
   * Deletes a Source.
   */
  async deleteSource(organizationId: string, sourceId: string) {
    await this.getSourceById(organizationId, sourceId);
    await prisma.source.delete({ where: { id: sourceId } });
    return { success: true, message: 'Source deleted successfully' };
  }
}
