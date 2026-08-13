export const APP_CONFIG = {
  name: 'Webhook Automation Platform',
  version: '1.0.0',
  defaultPageSize: 20,
  maxPageSize: 100,
  maxWebhookBodySizeBytes: 1024 * 1024 * 2, // 2 MB
  defaultTimeoutMs: 10000, // 10s
  maxRedirects: 3,
  defaultRetentionDays: 30,
};

export const PLANS_CONFIG = {
  FREE: {
    name: 'Free',
    maxBots: 3,
    maxEventsPerMonth: 1000,
    maxExecutionsPerMonth: 1000,
    maxMembers: 2,
    retentionDays: 7,
    rateLimitPerMin: 60,
  },
  STARTER: {
    name: 'Starter',
    maxBots: 10,
    maxEventsPerMonth: 25000,
    maxExecutionsPerMonth: 25000,
    maxMembers: 5,
    retentionDays: 30,
    rateLimitPerMin: 180,
  },
  PRO: {
    name: 'Pro',
    maxBots: 50,
    maxEventsPerMonth: 250000,
    maxExecutionsPerMonth: 250000,
    maxMembers: 15,
    retentionDays: 90,
    rateLimitPerMin: 600,
  },
  BUSINESS: {
    name: 'Business',
    maxBots: 200,
    maxEventsPerMonth: 1000000,
    maxExecutionsPerMonth: 1000000,
    maxMembers: 50,
    retentionDays: 180,
    rateLimitPerMin: 2000,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxBots: 999999,
    maxEventsPerMonth: 10000000,
    maxExecutionsPerMonth: 10000000,
    maxMembers: 999,
    retentionDays: 365,
    rateLimitPerMin: 10000,
  },
};
