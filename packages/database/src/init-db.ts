import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export async function ensureDatabaseTables(prisma: PrismaClient) {
  console.log('📦 Ensuring PostgreSQL database schema tables exist...');

  // 1. Create Enums individually if they do not exist
  const enumStatements = [
    {
      name: 'RoleName',
      sql: `CREATE TYPE "RoleName" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'OPERATOR', 'VIEWER');`,
    },
    {
      name: 'BotStatus',
      sql: `CREATE TYPE "BotStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR');`,
    },
    {
      name: 'BotMode',
      sql: `CREATE TYPE "BotMode" AS ENUM ('LIVE', 'DRY_RUN', 'DEMO');`,
    },
    {
      name: 'SourceType',
      sql: `CREATE TYPE "SourceType" AS ENUM ('WEBHOOK', 'REST_API', 'POLLING_API', 'CUSTOM_HTTP');`,
    },
    {
      name: 'ActionType',
      sql: `CREATE TYPE "ActionType" AS ENUM ('HTTP_REQUEST', 'REST_API', 'WEBHOOK', 'DATABASE_ACTION', 'TELEGRAM_NOTIFICATION', 'EMAIL_NOTIFICATION', 'CUSTOM_ACTION');`,
    },
    {
      name: 'ExecutionStatus',
      sql: `CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'SKIPPED', 'DUPLICATE');`,
    },
    {
      name: 'PlanTier',
      sql: `CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE');`,
    },
  ];

  for (const item of enumStatements) {
    try {
      await prisma.$executeRawUnsafe(item.sql);
      console.log(`✅ Created enum ${item.name}`);
    } catch (err: any) {
      // Ignore already existing enum types
      if (!err.message?.includes('already exists')) {
        console.warn(`Note on enum ${item.name}:`, err.message);
      }
    }
  }

  // 2. Create Tables individually
  const tableStatements = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "fullName" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
        "avatarUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'organizations',
      sql: `CREATE TABLE IF NOT EXISTS "organizations" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "isDemo" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'organization_members',
      sql: `CREATE TABLE IF NOT EXISTS "organization_members" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role" "RoleName" NOT NULL DEFAULT 'VIEWER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "organization_members_organizationId_userId_key" UNIQUE ("organizationId", "userId")
      );`,
    },
    {
      name: 'bots',
      sql: `CREATE TABLE IF NOT EXISTS "bots" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" "BotStatus" NOT NULL DEFAULT 'DRAFT',
        "mode" "BotMode" NOT NULL DEFAULT 'LIVE',
        "publicKey" TEXT UNIQUE NOT NULL,
        "version" INTEGER NOT NULL DEFAULT 1,
        "payloadSchema" JSONB,
        "rules" JSONB,
        "actions" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'bot_versions',
      sql: `CREATE TABLE IF NOT EXISTS "bot_versions" (
        "id" TEXT PRIMARY KEY,
        "botId" TEXT NOT NULL REFERENCES "bots"("id") ON DELETE CASCADE,
        "versionNumber" INTEGER NOT NULL,
        "payloadSchema" JSONB,
        "rules" JSONB,
        "actions" JSONB NOT NULL,
        "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "bot_versions_botId_versionNumber_key" UNIQUE ("botId", "versionNumber")
      );`,
    },
    {
      name: 'sources',
      sql: `CREATE TABLE IF NOT EXISTS "sources" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "botId" TEXT REFERENCES "bots"("id") ON DELETE SET NULL,
        "name" TEXT NOT NULL,
        "type" "SourceType" NOT NULL DEFAULT 'WEBHOOK',
        "status" "BotStatus" NOT NULL DEFAULT 'ACTIVE',
        "publicKey" TEXT UNIQUE NOT NULL,
        "secretEncrypted" TEXT,
        "config" JSONB,
        "secretKeyHash" TEXT,
        "eventsCount" INTEGER NOT NULL DEFAULT 0,
        "lastEventAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'events',
      sql: `CREATE TABLE IF NOT EXISTS "events" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "botId" TEXT NOT NULL REFERENCES "bots"("id") ON DELETE CASCADE,
        "idempotencyKey" TEXT,
        "payload" JSONB NOT NULL,
        "headers" JSONB,
        "sourceIp" TEXT,
        "status" TEXT NOT NULL DEFAULT 'RECEIVED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "events_botId_idempotencyKey_key" UNIQUE ("botId", "idempotencyKey")
      );`,
    },
    {
      name: 'executions',
      sql: `CREATE TABLE IF NOT EXISTS "executions" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "botId" TEXT NOT NULL REFERENCES "bots"("id") ON DELETE CASCADE,
        "eventId" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "status" "ExecutionStatus" NOT NULL DEFAULT 'QUEUED',
        "mode" "BotMode" NOT NULL DEFAULT 'LIVE',
        "retryAttempt" INTEGER NOT NULL DEFAULT 0,
        "durationMs" INTEGER NOT NULL DEFAULT 0,
        "errorDetails" JSONB,
        "actionResults" JSONB,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3)
      );`,
    },
    {
      name: 'execution_steps',
      sql: `CREATE TABLE IF NOT EXISTS "execution_steps" (
        "id" TEXT PRIMARY KEY,
        "executionId" TEXT NOT NULL REFERENCES "executions"("id") ON DELETE CASCADE,
        "stepName" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "input" JSONB,
        "output" JSONB,
        "error" TEXT,
        "durationMs" INTEGER NOT NULL DEFAULT 0,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'api_keys',
      sql: `CREATE TABLE IF NOT EXISTS "api_keys" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "keyHash" TEXT UNIQUE NOT NULL,
        "prefix" TEXT NOT NULL,
        "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "lastUsedAt" TIMESTAMP(3),
        "expiresAt" TIMESTAMP(3),
        "revokedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'subscriptions',
      sql: `CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
    {
      name: 'usage_records',
      sql: `CREATE TABLE IF NOT EXISTS "usage_records" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "metric" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 0,
        "period" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "usage_records_organizationId_metric_period_key" UNIQUE ("organizationId", "metric", "period")
      );`,
    },
    {
      name: 'feature_flags',
      sql: `CREATE TABLE IF NOT EXISTS "feature_flags" (
        "id" TEXT PRIMARY KEY,
        "key" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "isEnabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
    },
  ];

  for (const tbl of tableStatements) {
    try {
      await prisma.$executeRawUnsafe(tbl.sql);
      console.log(`✅ Table verified/created: ${tbl.name}`);
    } catch (err: any) {
      console.error(`❌ Failed to create table ${tbl.name}:`, err.message);
    }
  }

  // 3. Seed Default Admin User directly via raw SQL or Prisma
  try {
    const adminEmail = 'admin@webhookplatform.io';
    const existingUsers = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id" FROM "users" WHERE "email" = $1 LIMIT 1;`,
      adminEmail
    );

    if (!existingUsers || existingUsers.length === 0) {
      console.log('🌱 Seeding default admin account (admin@webhookplatform.io)...');
      const salt = crypto.randomBytes(16).toString('hex');
      const derivedKey = crypto.scryptSync('Admin123456!', salt, 64);
      const passwordHash = `${salt}:${derivedKey.toString('hex')}`;
      const userId = 'usr_admin_default_01';
      const orgId = 'org_admin_default_01';

      await prisma.$executeRawUnsafe(
        `INSERT INTO "users" ("id", "email", "fullName", "passwordHash", "isEmailVerified")
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT ("email") DO NOTHING;`,
        userId,
        adminEmail,
        'Platform Administrator',
        passwordHash
      );

      await prisma.$executeRawUnsafe(
        `INSERT INTO "organizations" ("id", "name", "slug")
         VALUES ($1, $2, $3)
         ON CONFLICT ("slug") DO NOTHING;`,
        orgId,
        'Main Enterprise Org',
        'main-enterprise-org'
      );

      await prisma.$executeRawUnsafe(
        `INSERT INTO "organization_members" ("id", "organizationId", "userId", "role")
         VALUES ($1, $2, $3, 'OWNER')
         ON CONFLICT ("organizationId", "userId") DO NOTHING;`,
        'mem_admin_default_01',
        orgId,
        userId
      );

      const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "subscriptions" ("id", "organizationId", "planTier", "status", "currentPeriodEnd")
         VALUES ($1, $2, 'ENTERPRISE', 'ACTIVE', $3);`,
        'sub_admin_default_01',
        orgId,
        periodEnd
      );

      console.log('✅ Default admin account seeded successfully!');
    } else {
      console.log('ℹ️ Admin account already exists in PostgreSQL.');
    }
  } catch (seedErr: any) {
    console.error('❌ Failed to seed admin account:', seedErr.message);
  }
}
