"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const database_1 = require("@webhook-auto/database");
const security_1 = require("@webhook-auto/security");
const http_adapter_1 = require("./adapters/http.adapter");
const telegram_adapter_1 = require("./adapters/telegram.adapter");
const email_adapter_1 = require("./adapters/email.adapter");
const types_1 = require("@webhook-auto/types");
const adapters = {
    [types_1.ActionType.HTTP_REQUEST]: new http_adapter_1.HttpAdapter(),
    [types_1.ActionType.REST_API]: new http_adapter_1.HttpAdapter(),
    [types_1.ActionType.WEBHOOK]: new http_adapter_1.HttpAdapter(),
    [types_1.ActionType.TELEGRAM_NOTIFICATION]: new telegram_adapter_1.TelegramAdapter(),
    [types_1.ActionType.EMAIL_NOTIFICATION]: new email_adapter_1.EmailAdapter(),
};
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('⚡ Starting Webhook Processing Worker...');
const worker = new bullmq_1.Worker('webhook-processing', async (job) => {
    const { eventId, executionId, botId, organizationId } = job.data;
    const startTime = Date.now();
    console.log(`[Worker] Processing Job ${job.id} for Execution ${executionId}`);
    // Fetch details from database
    const [execution, event, bot] = await Promise.all([
        database_1.prisma.execution.findUnique({ where: { id: executionId } }),
        database_1.prisma.event.findUnique({ where: { id: eventId } }),
        database_1.prisma.bot.findUnique({ where: { id: botId } }),
    ]);
    if (!execution || !event || !bot) {
        console.error(`[Worker] Execution or Event missing for ID ${executionId}`);
        return;
    }
    // Update status to RUNNING
    await database_1.prisma.execution.update({
        where: { id: executionId },
        data: { status: database_1.ExecutionStatus.RUNNING },
    });
    const payload = event.payload;
    const rules = bot.rules;
    const actions = bot.actions || [];
    // Step 1: Rule Evaluation
    const ruleStartTime = Date.now();
    const rulePassed = rules ? (0, security_1.evaluateRuleGroup)(rules, payload) : true;
    await database_1.prisma.executionStep.create({
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
        await database_1.prisma.execution.update({
            where: { id: executionId },
            data: {
                status: database_1.ExecutionStatus.SKIPPED,
                durationMs: Date.now() - startTime,
                completedAt: new Date(),
            },
        });
        return;
    }
    // Step 2: Action Execution
    const actionResults = [];
    let hasFailure = false;
    for (const actConfig of actions) {
        const actStartTime = Date.now();
        const adapter = adapters[actConfig.type] || adapters[types_1.ActionType.HTTP_REQUEST];
        // If Bot is in DEMO or DRY_RUN mode, simulate actions without side-effects
        let result;
        if (bot.mode === database_1.BotMode.DEMO || bot.mode === database_1.BotMode.DRY_RUN) {
            result = {
                success: true,
                statusCode: 200,
                durationMs: 5,
                data: { simulated: true, mode: bot.mode, action: actConfig.name },
            };
        }
        else {
            result = await adapter.execute(actConfig, payload, { executionId, botId });
        }
        actionResults.push({ actionName: actConfig.name, result });
        await database_1.prisma.executionStep.create({
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
    const finalStatus = hasFailure ? database_1.ExecutionStatus.FAILED : database_1.ExecutionStatus.SUCCESS;
    await database_1.prisma.execution.update({
        where: { id: executionId },
        data: {
            status: finalStatus,
            durationMs: Date.now() - startTime,
            actionResults,
            completedAt: new Date(),
        },
    });
    console.log(`[Worker] Execution ${executionId} finished with status ${finalStatus}`);
}, {
    connection: { url: redisUrl },
    concurrency: 10,
});
worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});
worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
//# sourceMappingURL=index.js.map