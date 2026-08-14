import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, BotStatus } from '@webhook-auto/database';
import { WebhooksService } from '../webhooks/webhooks.service';

/**
 * TestingService — sends a real event through the full webhook pipeline.
 *
 * The test event bypasses HMAC verification (since it originates from the
 * authenticated Dashboard, not an external source) but hits the real DB +
 * BullMQ + Worker path. Execution results are visible in the Executions UI.
 *
 * Note: The test event is always processed in the Bot's configured mode
 * (LIVE, DRY_RUN, or DEMO). Use DRY_RUN/DEMO mode bots for safe testing.
 */
@Injectable()
export class TestingService {
  constructor(private webhooksService: WebhooksService) {}

  async testEvent(
    organizationId: string,
    botId: string,
    payload: any,
  ): Promise<{
    success: boolean;
    eventId: string;
    executionId: string;
    message: string;
  }> {
    // Validate the bot exists and belongs to the caller's organization
    const bot = await prisma.bot.findFirst({
      where: { id: botId, organizationId },
    });

    if (!bot) {
      throw new NotFoundException(
        'Bot not found or does not belong to your organization',
      );
    }

    if (bot.status !== BotStatus.ACTIVE) {
      throw new BadRequestException(
        `Bot is currently "${bot.status}". Activate the bot before sending test events.`,
      );
    }

    // Route through the real ingestion pipeline using the bot's publicKey.
    // No HMAC header is sent — the webhook service only validates HMAC when
    // the signature header is present AND a WebhookSecret is configured.
    const result = await this.webhooksService.handleIncomingWebhook(
      bot.publicKey,
      payload || { test: true, source: 'dashboard-test-event' },
      {
        'x-test-event': 'true',
        'content-type': 'application/json',
      },
      '127.0.0.1',
    );

    return {
      success: true,
      eventId: result.eventId,
      executionId: result.executionId,
      message:
        'Test event queued successfully. Check the Executions page for real-time results.',
    };
  }
}
