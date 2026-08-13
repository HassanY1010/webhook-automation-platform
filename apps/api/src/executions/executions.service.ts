import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, ExecutionStatus } from '@webhook-auto/database';

@Injectable()
export class ExecutionsService {
  async getExecutions(organizationId: string, botId?: string, page: number = 1, limit: number = 20) {
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

    return { executions, total, page, totalPages: Math.ceil(total / limit) };
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

  async retryExecution(organizationId: string, executionId: string) {
    const execution = await this.getExecutionById(organizationId, executionId);

    const newExecution = await prisma.execution.create({
      data: {
        organizationId: execution.organizationId,
        botId: execution.botId,
        eventId: execution.eventId,
        mode: execution.mode,
        retryAttempt: execution.retryAttempt + 1,
        status: ExecutionStatus.QUEUED,
      },
    });

    return newExecution;
  }
}
