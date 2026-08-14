import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma, BotStatus, ExecutionStatus } from '@webhook-auto/database';
import { RedisService } from '../common/services/redis.service';
import { verifyHmacSignature, decryptSecret } from '@webhook-auto/security';
import { Queue } from 'bullmq';

@Injectable()
export class WebhooksService {
  private webhookQueue: Queue;

  constructor(private redisService: RedisService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.webhookQueue = new Queue('webhook-processing', {
      connection: { url: redisUrl },
    });
  }

  async handleIncomingWebhook(
    publicKey: string,
    payload: any,
    headers: Record<string, string>,
    ipAddress: string,
  ) {
    // 1. Resolve target: Check Source first, then fallback to Bot for backward compatibility
    let bot: any = null;
    let source: any = null;
    let organizationId: string;
    let secretForHmac: string | null = null;

    source = await prisma.source.findUnique({
      where: { publicKey },
      include: {
        bot: true,
        organization: true,
      },
    });

    if (source) {
      if (source.status !== BotStatus.ACTIVE) {
        throw new ForbiddenException(`Ingestion Source is currently ${source.status}`);
      }

      if (!source.botId || !source.bot) {
        throw new BadRequestException('Source is not linked to any active bot');
      }

      bot = source.bot;
      organizationId = source.organizationId;

      if (source.secretEncrypted) {
        try {
          secretForHmac = decryptSecret(source.secretEncrypted);
        } catch {
          secretForHmac = source.secretEncrypted;
        }
      }
    } else {
      // Legacy fallback: lookup Bot by publicKey directly
      bot = await prisma.bot.findUnique({
        where: { publicKey },
        include: { organization: true },
      });

      if (!bot) {
        throw new NotFoundException('Webhook target source or bot not found');
      }

      organizationId = bot.organizationId;
    }

    if (bot.status !== BotStatus.ACTIVE) {
      throw new ForbiddenException(`Bot is currently ${bot.status}`);
    }

    // 2. Signature & HMAC Check
    const signature = headers['x-webhook-signature'] || headers['x-signature'];
    const timestamp = headers['x-webhook-timestamp'] || headers['x-timestamp'];

    // If source has a dedicated secret, verify against it
    if (signature) {
      if (secretForHmac) {
        const isValid = verifyHmacSignature({
          payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
          signature,
          secret: secretForHmac,
          timestamp,
        });

        if (!isValid) {
          throw new ForbiddenException('Invalid HMAC signature or expired timestamp');
        }
      } else {
        // Fallback to Org webhook secret if exists
        const webhookSecret = await prisma.webhookSecret.findFirst({
          where: { organizationId },
        });

        if (webhookSecret) {
          const isValid = verifyHmacSignature({
            payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
            signature,
            secret: webhookSecret.secretEncrypted,
            timestamp,
          });

          if (!isValid) {
            throw new ForbiddenException('Invalid HMAC signature or expired timestamp');
          }
        }
      }
    }

    // 3. Idempotency Check
    const idempotencyKey = headers['x-idempotency-key'] || headers['idempotency-key'];
    if (idempotencyKey) {
      const redisKey = `idempotency:${bot.id}:${idempotencyKey}`;
      const existing = await this.redisService.get(redisKey);
      if (existing) {
        return {
          success: true,
          eventId: existing,
          status: 'duplicate',
          message: 'Duplicate event ignored due to idempotency key',
        };
      }
    }

    // 4. Persist Event to Database
    const event = await prisma.event.create({
      data: {
        organizationId,
        botId: bot.id,
        idempotencyKey,
        payload: payload || {},
        headers: headers || {},
        sourceIp: ipAddress,
        status: 'RECEIVED',
      },
    });

    if (idempotencyKey) {
      await this.redisService.set(`idempotency:${bot.id}:${idempotencyKey}`, event.id, 86400); // 24h
    }

    // Update Source metrics asynchronously if invoked through a Source
    if (source) {
      prisma.source
        .update({
          where: { id: source.id },
          data: {
            eventsCount: { increment: 1 },
            lastEventAt: new Date(),
          },
        })
        .catch(() => {});
    }

    // 5. Create Execution Shell Record
    const execution = await prisma.execution.create({
      data: {
        organizationId,
        botId: bot.id,
        eventId: event.id,
        mode: bot.mode,
        status: ExecutionStatus.QUEUED,
      },
    });

    // 6. Enqueue BullMQ Job
    try {
      await this.webhookQueue.add('process-event', {
        eventId: event.id,
        executionId: execution.id,
        botId: bot.id,
        organizationId,
      });
    } catch (err: any) {
      console.warn('Queue addition fallback:', err.message);
    }

    return {
      success: true,
      eventId: event.id,
      executionId: execution.id,
      status: 'queued',
    };
  }
}
