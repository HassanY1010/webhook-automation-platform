import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, ExecutionStatus } from '@webhook-auto/database';
import { Queue } from 'bullmq';

@Injectable()
export class ExecutionsService {
  private webhookQueue: Queue;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.webhookQueue = new Queue('webhook-processing', {
      connection: { url: redisUrl },
    });
  }

  async getExecutions(
    organizationId: string,
    botId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };
    if (botId) where.botId = botId;

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        include: { bot: { select: { name: true } }, event: true },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.execution.count({ where }),
    ]);

    return {
      executions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExecutionById(organizationId: string, executionId: string) {
    const execution = await prisma.execution.findFirst({
      where: { id: executionId, organizationId },
      include: {
        bot: true,
        event: true,
        steps: { orderBy: { timestamp: 'asc' } },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution trace not found');
    }
    return execution;
  }

  async getDeadLetterQueue(organizationId: string) {
    return prisma.execution.findMany({
      where: { organizationId, status: ExecutionStatus.FAILED },
      include: { bot: true, event: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Manual retry: validates the execution belongs to the caller's org,
   * creates a new Execution record, and enqueues a real BullMQ job.
   *
   * The original failed execution is left intact for audit purposes.
   */
  async retryExecution(organizationId: string, executionId: string) {
    // Validates org-ownership — throws NotFoundException if not found
    const original = await this.getExecutionById(organizationId, executionId);

    // Only allow retrying FAILED executions
    if (original.status !== ExecutionStatus.FAILED) {
      throw new BadRequestException(
        `Execution is in status "${original.status}" and cannot be retried. Only FAILED executions can be retried.`,
      );
    }

    // Create a fresh Execution record for the retry attempt
    const newExecution = await prisma.execution.create({
      data: {
        organizationId: original.organizationId,
        botId: original.botId,
        eventId: original.eventId,
        mode: original.mode,
        retryAttempt: original.retryAttempt + 1,
        status: ExecutionStatus.QUEUED,
      },
    });

    // Enqueue the actual BullMQ job so the worker picks it up
    // This was missing before — the critical fix for P0-04
    await this.webhookQueue.add('process-event', {
      eventId: original.eventId,
      executionId: newExecution.id,
      botId: original.botId,
      organizationId: original.organizationId,
    });

    return newExecution;
  }
}
