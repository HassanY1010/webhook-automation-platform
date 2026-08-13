import { z } from 'zod';
import { RuleOperator, LogicalOperator, BotMode, ActionType, SourceType } from '@webhook-auto/types';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Bot Schemas
export const ConditionSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  operator: z.nativeEnum(RuleOperator),
  value: z.any(),
});

export const RuleGroupSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    logicalOperator: z.nativeEnum(LogicalOperator),
    conditions: z.array(ConditionSchema),
    subGroups: z.array(RuleGroupSchema).optional(),
  })
);

export const ActionConfigSchema = z.object({
  type: z.nativeEnum(ActionType),
  name: z.string().min(1, 'Action name is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  url: z.string().url('Invalid destination URL').optional(),
  headers: z.record(z.string()).optional(),
  bodyTemplate: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramMessageTemplate: z.string().optional(),
  emailTo: z.string().email().optional(),
  emailSubject: z.string().optional(),
  emailBodyTemplate: z.string().optional(),
  timeoutMs: z.number().min(500).max(60000).optional().default(10000),
  retryPolicy: z
    .object({
      maxAttempts: z.number().min(1).max(10).default(3),
      backoffMs: z.number().min(100).max(60000).default(1000),
    })
    .optional(),
});

export const CreateBotSchema = z.object({
  name: z.string().min(2, 'Bot name must be at least 2 characters'),
  description: z.string().optional(),
  mode: z.nativeEnum(BotMode).default(BotMode.LIVE),
  sourceType: z.nativeEnum(SourceType).default(SourceType.WEBHOOK),
  payloadSchema: z.record(z.any()).optional(),
  rules: RuleGroupSchema.optional(),
  actions: z.array(ActionConfigSchema).min(1, 'At least one action is required'),
});

export const UpdateBotSchema = CreateBotSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR']).optional(),
});

// API Key Schema
export const CreateApiKeySchema = z.object({
  name: z.string().min(2, 'Key name is required'),
  expiresInDays: z.number().optional(),
  scopes: z.array(z.string()).default(['*']),
});

// Test Event Schema
export const TestEventSchema = z.object({
  payload: z.record(z.any()),
  headers: z.record(z.string()).optional(),
});
