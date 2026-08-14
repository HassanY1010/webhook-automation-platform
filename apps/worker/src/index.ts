import { Worker, Job, Queue } from 'bullmq';
import { prisma, ExecutionStatus, BotMode } from '@webhook-auto/database';
import { evaluateRuleGroup } from '@webhook-auto/security';
import { HttpAdapter } from './adapters/http.adapter';
import { TelegramAdapter } from './adapters/telegram.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { ActionAdapter } from './adapters/adapter.interface';
import { ActionType } from '@webhook-auto/types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** HTTP status codes that are permanent failures — do not retry. */
const PERMANENT_FAILURE_STATUS_CODES = new Set([400, 401, 403, 404, 422]);

/** Maximum automatic retry attempts before a job is dead-lettered. */
const MAX_JOB_ATTEMPTS = 3;

/** Base delay in ms for exponential backoff: 5s → 25s → 125s */
const BACKOFF_BASE_DELAY_MS = 5_000;

// ─── Infrastructure ────────────────────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConnection = { url: redisUrl };

const adapters: Record<string, ActionAdapter> = {
  [ActionType.HTTP_REQUEST]: new HttpAdapter(),
  [ActionType.REST_API]: new HttpAdapter(),
  [ActionType.WEBHOOK]: new HttpAdapter(),
  [ActionType.TELEGRAM_NOTIFICATION]: new TelegramAdapter(),
  [ActionType.EMAIL_NOTIFICATION]: new EmailAdapter(),
};

// ─── Job Processor ────────────────────────────────────────────────────────────

async function processWebhookJob(job: Job): Promise<void> {
  const { eventId, executionId, botId, organizationId } = job.data;
  const startTime = Date.now();

  console.log(`[Worker] Processing Job ${job.id} | Execution ${executionId} | Attempt ${job.attemptsMade + 1}/${MAX_JOB_ATTEMPTS}`);

  // ── Fetch required records ─────────────────────────────────────────────────
  const [execution, event, bot] = await Promise.all([
    prisma.execution.findUnique({ where: { id: executionId } }),
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.bot.findUnique({ where: { id: botId } }),
  ]);

  if (!execution || !event || !bot) {
    // Permanent failure — missing records will not appear on retry
    console.error(`[Worker] Missing records for Execution ${executionId}. Marking permanent failure.`);
    await prisma.execution
      .update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.FAILED,
          errorDetails: { code: 'MISSING_RECORDS', message: 'Execution, Event, or Bot record not found' },
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      })
      .catch(() => {});
    // Throw a non-retryable error by removing it from BullMQ attempts
    const err = new Error('PERMANENT: Missing execution records') as any;
    err.retryable = false;
    throw err;
  }

  // ── Mark RUNNING ──────────────────────────────────────────────────────────
  await prisma.execution.update({
    where: { id: executionId },
    data: { status: ExecutionStatus.RUNNING },
  });

  const payload = event.payload as any;
  const rules = bot.rules as any;
  const actions = (bot.actions as any[]) || [];

  // ── Step 1: Rule Evaluation ───────────────────────────────────────────────
  const ruleStartTime = Date.now();
  let rulePassed: boolean;
  try {
    rulePassed = rules ? evaluateRuleGroup(rules, payload) : true;
  } catch (ruleErr: any) {
    // Invalid rule config — permanent failure
    await prisma.executionStep.create({
      data: {
        executionId,
        stepName: 'AST Rule Evaluation',
        status: 'FAILED',
        input: { rules },
        error: ruleErr.message,
        durationMs: Date.now() - ruleStartTime,
      },
    });
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        errorDetails: { code: 'RULE_EVALUATION_ERROR', message: ruleErr.message },
        durationMs: Date.now() - startTime,
        completedAt: new Date(),
      },
    });
    const err = new Error(`PERMANENT: Rule evaluation error: ${ruleErr.message}`) as any;
    err.retryable = false;
    throw err;
  }

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

  // ── Step 2: Action Execution ──────────────────────────────────────────────
  const actionResults: any[] = [];
  let hasFailure = false;
  let hasRetryableFailure = false;

  for (const actConfig of actions) {
    const actStartTime = Date.now();
    const adapter = adapters[actConfig.type] || adapters[ActionType.HTTP_REQUEST];

    let result;

    if (bot.mode === BotMode.DEMO || bot.mode === BotMode.DRY_RUN) {
      // Simulate without side-effects in non-live modes
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
      // Check if the HTTP adapter marked this as retryable
      if (result.error?.retryable === true) {
        hasRetryableFailure = true;
      }
      // Non-retryable HTTP status codes (400, 401, 403, 404, 422)
      if (
        result.statusCode &&
        PERMANENT_FAILURE_STATUS_CODES.has(result.statusCode)
      ) {
        hasRetryableFailure = false;
      }
    }
  }

  // ── Step 3: Finalise Execution ────────────────────────────────────────────
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

  console.log(`[Worker] Execution ${executionId} → ${finalStatus}`);

  // ── Step 4: Throw for BullMQ retry if transient failure ──────────────────
  // BullMQ automatically retries when the processor throws.
  // Only throw (and trigger retry) for transient failures.
  if (hasFailure && hasRetryableFailure) {
    // Reset execution status back to QUEUED so retried job looks fresh
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: ExecutionStatus.QUEUED, completedAt: null },
    });
    throw new Error(`Transient action failure — BullMQ will retry (attempt ${job.attemptsMade + 1}/${MAX_JOB_ATTEMPTS})`);
  }
}

// ─── Worker Configuration ─────────────────────────────────────────────────────

console.log('⚡ Starting Webhook Processing Worker...');

const worker = new Worker('webhook-processing', processWebhookJob, {
  connection: redisConnection,
  concurrency: 10,
  // P1-01: Exponential backoff retry — 5s → 25s → 125s
  // BullMQ applies these when the processor throws
  defaultJobOptions: {
    attempts: MAX_JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: BACKOFF_BASE_DELAY_MS,
    },
    removeOnComplete: { count: 500 },
    removeOnFail: false, // Keep failed jobs for DLQ visibility
  },
} as any);

// ─── Worker Events ─────────────────────────────────────────────────────────────

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', async (job, err) => {
  if (!job) return;

  const isLastAttempt = job.attemptsMade >= MAX_JOB_ATTEMPTS - 1;
  console.error(
    `[Worker] Job ${job.id} failed (attempt ${job.attemptsMade + 1}/${MAX_JOB_ATTEMPTS}): ${err.message}`,
  );

  // ── P1-02: DLQ — on final failure, ensure execution is marked FAILED ──────
  if (isLastAttempt) {
    const { executionId } = job.data || {};
    if (executionId) {
      try {
        await prisma.execution.update({
          where: { id: executionId },
          data: {
            status: ExecutionStatus.FAILED,
            errorDetails: {
              code: 'MAX_RETRIES_EXCEEDED',
              message: err.message,
              attemptsMade: job.attemptsMade + 1,
              failedAt: new Date().toISOString(),
            },
            completedAt: new Date(),
          },
        });
        console.error(
          `[Worker] Execution ${executionId} dead-lettered after ${job.attemptsMade + 1} attempts`,
        );
      } catch (dbErr: any) {
        console.error(`[Worker] Failed to update DLQ execution status: ${dbErr.message}`);
      }
    }
  }
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err.message);
});
