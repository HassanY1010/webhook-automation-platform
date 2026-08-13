# Architecture Overview & System Design

## System Architecture

```text
[ Producers / Webhooks ] ──> [ Nginx Reverse Proxy ] ──> [ NestJS Ingestion Gateway ]
                                                                   │
                                                                   ▼
                                                       [ PostgreSQL Event Store ]
                                                                   │
                                                                   ▼
                                                       [ Redis / BullMQ Queues ]
                                                                   │
                                                                   ▼
                                                       [ BullMQ Workers ]
                                                                   │
                                                      ┌────────────┴────────────┐
                                                      ▼                         ▼
                                             [ AST Rule Engine ]       [ SSRF Action Engine ]
                                                                                │
                                                                                ▼
                                                                     [ Upstream API / Telegram ]
```

## Modular Microservices & Monorepo Packages

1. **`apps/api` (NestJS Gateway)**:
   - High-throughput asynchronous HTTP gateway.
   - Handles authentication, RBAC authorization, tenant isolation, bot CRUD, versioning, and webhook ingestion.
   - Responds instantly with `202 Accepted` and `eventId`.

2. **`apps/worker` (BullMQ Worker)**:
   - Asynchronous worker process executing BullMQ queue jobs.
   - Evaluates dynamic AST rules without using unsafe JavaScript `eval()`.
   - Dispatches outgoing HTTP/REST actions with SSRF protection.
   - Manages retries with exponential backoff & Dead Letter Queue (DLQ).

3. **`apps/web` (Next.js Dashboard)**:
   - High-performance, responsive React dashboard built with Next.js 14/15 App Router.
   - Features dark mode glassmorphism, Recharts telemetry, bilingual Arabic & English support with RTL/LTR layout switching.
   - Includes Visual Rule Builder and step-by-step execution trace inspector.

4. **`packages/security`**:
   - AES-256-GCM secret encryption at rest.
   - SSRF protection validator blocking loopback, link-local, RFC1918 private IPs, and cloud metadata endpoints (`169.254.169.254`).
   - HMAC-SHA256 signature verification & timestamp tolerance check.
   - AST-sandboxed dynamic rule evaluator.

5. **`packages/database`**:
   - Prisma ORM schema, migrations, and database seed script.
