import { Worker, Job } from 'bullmq';
import { prisma, ExecutionStatus, BotMode } from '@webhook-auto/database';
import { evaluateRuleGroup } from '@webhook-auto/security';
import { HttpAdapter } from './adapters/http.adapter';
import { TelegramAdapter } from './adapters/telegram.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { ActionAdapter } from './adapters/adapter.interface';
import { ActionType } from '@webhook-auto/types';

const adapters: Record<string, ActionAdapter> = {
  [ActionType.HTTP_REQUEST]: new HttpAdapter(),
  [ActionType.REST_API]: new HttpAdapter(),
  [ActionType.WEBHOOK]: new HttpAdapter(),
  [ActionType.TELEGRAM_NOTIFICATION]: new TelegramAdapter(),
  [ActionType.EMAIL_NOTIFICATION]: new EmailAdapter(),
};

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('⚡ Starting Webhook Processing Worker...');

const worker = new Worker(
  'webhook-processing',
  async (job: Job) => {
    const { eventId, executionId, botId, organizationId } = job.data;
    const startTime = Date.now();

    console.log(`[Worker] Processing Job ${job.id} for Execution ${executionId}`);

    // Fetch details from database
    const [execution, event, bot] = await Promise.all([
      prisma.execution.findUnique({ where: { id: executionId } }),
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.bot.findUnique({ where: { id: botId } }),
    ]);

    if (!execution || !event || !bot) {
      console.error(`[Worker] Execution or Event missing for ID ${executionId}`);
      return;
    }

    // Update status to RUNNING
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: ExecutionStatus.RUNNING },
    });

    const payload = event.payload as any;
    const rules = bot.rules as any;
    const actions = (bot.actions as any[]) || [];

    // Step 1: Rule Evaluation
    const ruleStartTime = Date.now();
    const rulePassed = rules ? evaluateRuleGroup(rules, payload) : true;

    await prisma.executionStep.create({
      data: {
        executionId,
        stepName: 'AST Rule Evaluation',
        status: rulePassed ? 'SUCCESS' : 'SKIPPED',
        input: { rules },
        output: { passed: rulePassed },
        durationMs: Date.now() - ruleStartTime,
      },
    });

    if (!rulePassed) {
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.SKIPPED,
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      });
      return;
    }

    // Step 2: Action Execution
    const actionResults: any[] = [];
    let hasFailure = false;

    for (const actConfig of actions) {
      const actStartTime = Date.now();
      const adapter = adapters[actConfig.type] || adapters[ActionType.HTTP_REQUEST];

      // If Bot is in DEMO or DRY_RUN mode, simulate actions without side-effects
      let result;
      if (bot.mode === BotMode.DEMO || bot.mode === BotMode.DRY_RUN) {
        result = {
          success: true,
          statusCode: 200,
          durationMs: 5,
          data: { simulated: true, mode: bot.mode, action: actConfig.name },
        };
      } else {
        result = await adapter.execute(actConfig, payload, { executionId, botId });
      }

      actionResults.push({ actionName: actConfig.name, result });

      await prisma.executionStep.create({
        data: {
          executionId,
          stepName: `Action: ${actConfig.name}`,
          status: result.success ? 'SUCCESS' : 'FAILED',
          input: { type: actConfig.type, url: actConfig.url },
          output: result.data || null,
          error: result.error?.message || null,
          durationMs: Date.now() - actStartTime,
        },
      });

      if (!result.success) {
        hasFailure = true;
      }
    }

    // Step 3: Complete Execution
    const finalStatus = hasFailure ? ExecutionStatus.FAILED : ExecutionStatus.SUCCESS;

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: finalStatus,
        durationMs: Date.now() - startTime,
        actionResults,
        completedAt: new Date(),
      },
    });

    console.log(`[Worker] Execution ${executionId} finished with status ${finalStatus}`);
  },
  {
    connection: { url: redisUrl },
    concurrency: 10,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
