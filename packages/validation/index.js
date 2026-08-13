"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEventSchema = exports.CreateApiKeySchema = exports.UpdateBotSchema = exports.CreateBotSchema = exports.ActionConfigSchema = exports.RuleGroupSchema = exports.ConditionSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("@webhook-auto/types");
// Auth Schemas
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    organizationName: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// Bot Schemas
exports.ConditionSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, 'Field name is required'),
    operator: zod_1.z.nativeEnum(types_1.RuleOperator),
    value: zod_1.z.any(),
});
exports.RuleGroupSchema = zod_1.z.lazy(() => zod_1.z.object({
    logicalOperator: zod_1.z.nativeEnum(types_1.LogicalOperator),
    conditions: zod_1.z.array(exports.ConditionSchema),
    subGroups: zod_1.z.array(exports.RuleGroupSchema).optional(),
}));
exports.ActionConfigSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(types_1.ActionType),
    name: zod_1.z.string().min(1, 'Action name is required'),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    url: zod_1.z.string().url('Invalid destination URL').optional(),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    bodyTemplate: zod_1.z.string().optional(),
    telegramChatId: zod_1.z.string().optional(),
    telegramMessageTemplate: zod_1.z.string().optional(),
    emailTo: zod_1.z.string().email().optional(),
    emailSubject: zod_1.z.string().optional(),
    emailBodyTemplate: zod_1.z.string().optional(),
    timeoutMs: zod_1.z.number().min(500).max(60000).optional().default(10000),
    retryPolicy: zod_1.z
        .object({
        maxAttempts: zod_1.z.number().min(1).max(10).default(3),
        backoffMs: zod_1.z.number().min(100).max(60000).default(1000),
    })
        .optional(),
});
exports.CreateBotSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Bot name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    mode: zod_1.z.nativeEnum(types_1.BotMode).default(types_1.BotMode.LIVE),
    sourceType: zod_1.z.nativeEnum(types_1.SourceType).default(types_1.SourceType.WEBHOOK),
    payloadSchema: zod_1.z.record(zod_1.z.any()).optional(),
    rules: exports.RuleGroupSchema.optional(),
    actions: zod_1.z.array(exports.ActionConfigSchema).min(1, 'At least one action is required'),
});
exports.UpdateBotSchema = exports.CreateBotSchema.partial().extend({
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR']).optional(),
});
// API Key Schema
exports.CreateApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Key name is required'),
    expiresInDays: zod_1.z.number().optional(),
    scopes: zod_1.z.array(zod_1.z.string()).default(['*']),
});
// Test Event Schema
exports.TestEventSchema = zod_1.z.object({
    payload: zod_1.z.record(zod_1.z.any()),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
});
//# sourceMappingURL=index.js.map