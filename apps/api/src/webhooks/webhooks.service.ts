import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { prisma, BotStatus, ExecutionStatus } from '@webhook-auto/database';
import { RedisService } from '../common/services/redis.service';
import { verifyHmacSignature } from '@webhook-auto/security';
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
    ipAddress: string
  ) {
    const bot = await prisma.bot.findUnique({
      where: { publicKey },
      include: { organization: true },
    });

    if (!bot) {
      throw new NotFoundException('Webhook target bot not found');
    }

    if (bot.status !== BotStatus.ACTIVE) {
      throw new ForbiddenException(`Bot is currently ${bot.status}`);
    }

    // 1. Signature & HMAC Check if source secret key exists
    const signature = headers['x-webhook-signature'] || headers['x-signature'];
    const timestamp = headers['x-webhook-timestamp'] || headers['x-timestamp'];

    const webhookSecret = await prisma.webhookSecret.findFirst({
      where: { organizationId: bot.organizationId },
    });

    if (webhookSecret && signature) {
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

    // 2. Idempotency Check
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

    // 3. Persist Event to Database
    const event = await prisma.event.create({
      data: {
        organizationId: bot.organizationId,
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

    // 4. Create Execution Shell Record
    const execution = await prisma.execution.create({
      data: {
        organizationId: bot.organizationId,
        botId: bot.id,
        eventId: event.id,
        mode: bot.mode,
        status: ExecutionStatus.QUEUED,
      },
    });

    // 5. Enqueue BullMQ Job
    try {
      await this.webhookQueue.add('process-event', {
        eventId: event.id,
        executionId: execution.id,
        botId: bot.id,
        organizationId: bot.organizationId,
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
