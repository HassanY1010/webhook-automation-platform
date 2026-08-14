import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export async function ensureDatabaseTables(prisma: PrismaClient) {
  console.log('📦 Ensuring PostgreSQL database schema tables exist via direct SQL...');

  const ddl = `
    -- Enums
    DO $$ BEGIN
      CREATE TYPE "RoleName" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'OPERATOR', 'VIEWER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "BotStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "BotMode" AS ENUM ('LIVE', 'DRY_RUN', 'DEMO');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "SourceType" AS ENUM ('WEBHOOK', 'REST_API', 'POLLING_API', 'CUSTOM_HTTP');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "ActionType" AS ENUM ('HTTP_REQUEST', 'REST_API', 'WEBHOOK', 'DATABASE_ACTION', 'TELEGRAM_NOTIFICATION', 'EMAIL_NOTIFICATION', 'CUSTOM_ACTION');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'SKIPPED', 'DUPLICATE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Users
    CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "fullName" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
      "avatarUrl" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Organizations
    CREATE TABLE IF NOT EXISTS "organizations" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT UNIQUE NOT NULL,
      "isDemo" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Organization Members
    CREATE TABLE IF NOT EXISTS "organization_members" (
      "id" TEXT PRIMARY KEY,
      "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "role" "RoleName" NOT NULL DEFAULT 'VIEWER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "organization_members_organizationId_userId_key" UNIQUE ("organizationId", "userId")
    );

    -- Bots
    CREATE TABLE IF NOT EXISTS "bots" (
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
    );

    -- Bot Versions
    CREATE TABLE IF NOT EXISTS "bot_versions" (
      "id" TEXT PRIMARY KEY,
      "botId" TEXT NOT NULL REFERENCES "bots"("id") ON DELETE CASCADE,
      "versionNumber" INTEGER NOT NULL,
      "payloadSchema" JSONB,
      "rules" JSONB,
      "actions" JSONB NOT NULL,
      "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "bot_versions_botId_versionNumber_key" UNIQUE ("botId", "versionNumber")
    );

    -- Sources
    CREATE TABLE IF NOT EXISTS "sources" (
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
    );

    -- Events
    CREATE TABLE IF NOT EXISTS "events" (
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
    );

    -- Executions
    CREATE TABLE IF NOT EXISTS "executions" (
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
    );

    -- Execution Steps
    CREATE TABLE IF NOT EXISTS "execution_steps" (
      "id" TEXT PRIMARY KEY,
      "executionId" TEXT NOT NULL REFERENCES "executions"("id") ON DELETE CASCADE,
      "stepName" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "input" JSONB,
      "output" JSONB,
      "error" TEXT,
      "durationMs" INTEGER NOT NULL DEFAULT 0,
      "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- API Keys
    CREATE TABLE IF NOT EXISTS "api_keys" (
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
    );

    -- Subscriptions
    CREATE TABLE IF NOT EXISTS "subscriptions" (
      "id" TEXT PRIMARY KEY,
      "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Usage Records
    CREATE TABLE IF NOT EXISTS "usage_records" (
      "id" TEXT PRIMARY KEY,
      "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "metric" TEXT NOT NULL,
      "count" INTEGER NOT NULL DEFAULT 0,
      "period" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "usage_records_organizationId_metric_period_key" UNIQUE ("organizationId", "metric", "period")
    );

    -- Feature Flags
    CREATE TABLE IF NOT EXISTS "feature_flags" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT UNIQUE NOT NULL,
      "description" TEXT,
      "isEnabled" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await prisma.$executeRawUnsafe(ddl);
  console.log('✅ PostgreSQL tables verified / created successfully!');

  // Seed default admin account if not exists
  const adminEmail = 'admin@webhookplatform.io';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    console.log('🌱 Seeding default admin account (admin@webhookplatform.io)...');
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync('Admin123456!', salt, 64);
    const passwordHash = `${salt}:${derivedKey.toString('hex')}`;

    const adminUser = await prisma.user.create({
      data: {
        id: 'usr_admin_default_01',
        email: adminEmail,
        fullName: 'Platform Administrator',
        passwordHash,
        isEmailVerified: true,
      },
    });

    const adminOrg = await prisma.organization.create({
      data: {
        id: 'org_admin_default_01',
        name: 'Main Enterprise Org',
        slug: 'main-enterprise-org',
      },
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: adminOrg.id,
        userId: adminUser.id,
        role: 'OWNER',
      },
    });

    await prisma.subscription.create({
      data: {
        organizationId: adminOrg.id,
        planTier: 'ENTERPRISE',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Default admin account seeded successfully!');
  }
}
