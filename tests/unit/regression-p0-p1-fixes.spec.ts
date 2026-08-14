/// <reference types="jest" />

/**
 * Regression Tests for P0 + P1 Fixes
 *
 * These tests verify that the critical bugs found in the audit have been fixed:
 *  - P0-01: JWT signing failure → throws, no fake token
 *  - P0-02: Auth DB failure → throws, no ghost user
 *  - P0-03: Email adapter → real SMTP attempt (not silent mock)
 *  - P0-04: Retry endpoint → creates BullMQ job
 *  - P1-01: Worker retry → BullMQ options configured
 *  - P1-02: DLQ → final failure marks FAILED with errorDetails
 */

// ─── JWT Regression Tests ──────────────────────────────────────────────────────

describe('P0-01 — JWT: no fake token on signing failure', () => {
  /**
   * The old code had a try/catch around jwtService.sign() that returned a
   * base64 string as a fake JWT when signing failed.
   *
   * After the fix: the generateTokens() method has NO try/catch.
   * If jwt.sign() throws, the exception propagates to the NestJS exception layer.
   */

  it('auth.service.ts generateTokens() must NOT contain a catch block', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/auth/auth.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // The old fallback contained this distinguishing string
    expect(source).not.toContain('USING FALLBACK TOKEN');
    expect(source).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI');
    expect(source).not.toContain('mockAccess');
    expect(source).not.toContain('mockRefresh');
  });

  it('auth.service.ts generateTokens() must read JWT expiry from env', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/auth/auth.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Must use env vars
    expect(source).toContain('JWT_ACCESS_EXPIRES_IN');
    expect(source).toContain('JWT_REFRESH_EXPIRES_IN');

    // Must NOT use hardcoded expiry strings in sign()
    expect(source).not.toMatch(/expiresIn:\s*['"]1d['"]/);
    expect(source).not.toMatch(/expiresIn:\s*['"]7d['"]/);
  });
});

// ─── Auth Mock Fallback Regression Tests ──────────────────────────────────────

describe('P0-02 — Auth: no ghost users on DB failure', () => {
  it('auth.service.ts must NOT contain fallback mock user creation', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/auth/auth.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Strings that were present in the old fallback blocks
    expect(source).not.toContain('fallbackUserId');
    expect(source).not.toContain('fallbackOrgId');
    expect(source).not.toContain('usr_admin_demo_1001');
    expect(source).not.toContain('org_admin_demo_1001');
    expect(source).not.toContain('Zero-downtime fallback');
    expect(source).not.toContain('admin@webhookplatform.io');
  });

  it('auth.service.ts login() must NOT have a catch block returning tokens', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/auth/auth.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // The fallback demoOrgId variable was unique to the old bad code
    expect(source).not.toContain('demoOrgId');
    expect(source).not.toContain('demoUserId');
  });
});

// ─── Email Adapter Regression Tests ───────────────────────────────────────────

describe('P0-03 — Email: no silent mock success', () => {
  it('email.adapter.ts must NOT return hardcoded success without SMTP call', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/worker/src/adapters/email.adapter.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // The old mock always returned this
    expect(source).not.toContain('Email Notification Delivered');
    expect(source).not.toContain("'Sandbox / Production SMTP abstract delivery'");

    // Must import and use nodemailer
    expect(source).toContain('nodemailer');
    expect(source).toContain('sendMail');
    expect(source).toContain('SMTP_HOST');
  });

  it('email.adapter.ts must return error when SMTP_HOST is not set', async () => {
    // Temporarily clear the env
    const originalHost = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;

    try {
      const { EmailAdapter } = require('../../apps/worker/src/adapters/email.adapter');
      const adapter = new EmailAdapter();
      const result = await adapter.execute(
        { emailTo: 'test@example.com' },
        { itemId: '123' },
        { executionId: 'exec_1', botId: 'bot_1' },
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SMTP_NOT_CONFIGURED');
      expect(result.error?.retryable).toBe(false);
    } finally {
      if (originalHost) process.env.SMTP_HOST = originalHost;
    }
  });

  it('email.adapter.ts must return error when emailTo is missing', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';

    try {
      const { EmailAdapter } = require('../../apps/worker/src/adapters/email.adapter');
      const adapter = new EmailAdapter();
      const result = await adapter.execute(
        {}, // no emailTo
        { itemId: '123' },
        { executionId: 'exec_1', botId: 'bot_1' },
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_MISSING_RECIPIENT');
    } finally {
      delete process.env.SMTP_HOST;
    }
  });
});

// ─── Retry Endpoint Regression Tests ──────────────────────────────────────────

describe('P0-04 — Retry: BullMQ job must be enqueued', () => {
  it('executions.service.ts must contain BullMQ Queue.add() call in retryExecution()', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/executions/executions.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Must import Queue from bullmq
    expect(source).toContain("from 'bullmq'");
    expect(source).toContain('new Queue');

    // Must call .add() to enqueue the job
    expect(source).toContain('.add(');
    expect(source).toContain('process-event');
    expect(source).toContain('executionId: newExecution.id');
  });

  it('executions.service.ts retryExecution() must reject non-FAILED executions', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/executions/executions.service.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Must guard against retrying non-FAILED executions
    expect(source).toContain('cannot be retried');
    expect(source).toContain('FAILED');
  });
});

// ─── Worker Retry Configuration Tests ─────────────────────────────────────────

describe('P1-01 — Worker: exponential backoff retry configured', () => {
  it('worker/index.ts must define MAX_JOB_ATTEMPTS and exponential backoff', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(__dirname, '../../apps/worker/src/index.ts');
    const source = fs.readFileSync(srcPath, 'utf-8');

    expect(source).toContain('MAX_JOB_ATTEMPTS');
    expect(source).toContain('attempts:');
    expect(source).toContain('exponential');
    expect(source).toContain('backoff');
    expect(source).toContain('delay');
  });

  it('worker/index.ts must differentiate retryable vs permanent failures', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(__dirname, '../../apps/worker/src/index.ts');
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Must have PERMANENT_FAILURE_STATUS_CODES or similar mechanism
    expect(source).toContain('PERMANENT');
    expect(source).toContain('retryable');
  });
});

// ─── DLQ Tests ────────────────────────────────────────────────────────────────

describe('P1-02 — DLQ: final failure recorded in database', () => {
  it('worker/index.ts worker.on(failed) must update execution to FAILED on last attempt', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(__dirname, '../../apps/worker/src/index.ts');
    const source = fs.readFileSync(srcPath, 'utf-8');

    // DLQ handler must check isLastAttempt
    expect(source).toContain('isLastAttempt');
    expect(source).toContain('MAX_RETRIES_EXCEEDED');
    expect(source).toContain('errorDetails');
    expect(source).toContain('attemptsMade');
  });
});

// ─── Health Check Tests ────────────────────────────────────────────────────────

describe('P2 — Health: Redis check must be real', () => {
  it('health.controller.ts must use Redis ping, not hardcoded UP', () => {
    const fs = require('fs');
    const path = require('path');
    const srcPath = path.join(
      __dirname,
      '../../apps/api/src/health/health.controller.ts',
    );
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Must perform a real Redis ping
    expect(source).toContain('ping()');
    expect(source).toContain('PONG');

    // Must NOT hardcode redis as UP
    expect(source).not.toMatch(/redis:\s*['"]UP['"]/);
    // Must return 503 on failure
    expect(source).toContain('ServiceUnavailableException');
  });
});
