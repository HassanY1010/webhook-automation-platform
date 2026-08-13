# Webhook Automation Platform

> **Production-Ready, Commercial-Grade, Multi-Tenant Webhook & REST API Automation SaaS Platform**

---

## 🚀 Overview

**Webhook Automation Platform** is an enterprise-grade SaaS platform that enables users to construct automated bots for ingesting event data via Webhooks or REST APIs, schema validation, AST dynamic sandboxed rule evaluation, executing multi-channel actions (HTTP/REST, Telegram, Email), step-by-step audit logging, and dead-letter queue (DLQ) retry management.

---

## 🛠 Tech Stack

- **Backend Gateway**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ, Pino Logger, OpenAPI/Swagger.
- **Worker Process**: Dedicated BullMQ worker process for asynchronous processing, distributed locking, and retry handling.
- **Frontend Dashboard**: Next.js 14/15 App Router, Tailwind CSS, Lucide React, TanStack Query, React Hook Form, Zod, Recharts, with bilingual Arabic (RTL) & English (LTR) support.
- **Security & Multi-Tenancy**: Organization isolation (`organizationId`), AES-256-GCM secret encryption, Argon2id/bcrypt password hashing, SSRF protection validator, HMAC-SHA256 signature verification, and AST dynamic sandboxed rule evaluator.
- **DevOps**: Docker, Docker Compose, Nginx, automated PostgreSQL backup script.

---

## 📁 Repository Structure

```text
webhook-automation-platform/
├── apps/
│   ├── api/                     # NestJS Gateway API
│   ├── worker/                  # BullMQ Worker Process
│   ├── web/                     # Next.js 14/15 Dashboard App
│   └── docs/                    # Static Documentation App
├── packages/
│   ├── database/                # Prisma Schema, Migrations, Seed
│   ├── config/                  # Shared Configuration & Plan Limits
│   ├── types/                   # Shared TypeScript Interfaces & DTOs
│   ├── validation/              # Shared Zod Validation Schemas
│   ├── logger/                  # Pino Structured Logger
│   ├── security/                # AES-256, SSRF, HMAC, AST Rule Engine
│   └── ui/                      # Shared UI Components
├── infrastructure/
│   ├── docker/                  # Production Dockerfiles
│   ├── nginx/                   # Nginx Reverse Proxy Config
│   └── scripts/                 # Backup & Maintenance Scripts
├── tests/                       # Unit, Integration & E2E Suites
└── docs/                        # Architecture & User Documentation
```

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Migration & Seeding
```bash
pnpm db:generate
pnpm db:seed
```

### 3. Launch Services with Docker Compose
```bash
pnpm docker:up
```

### 4. Run Development Applications
```bash
# Run NestJS API (Port 4000)
pnpm dev:api

# Run BullMQ Worker Process
pnpm dev:worker

# Run Next.js Dashboard (Port 3000)
pnpm dev:web
```

---

## 🔒 Security Highlights

- **Tenant Isolation**: Server-side enforced `organizationId` isolation across all database queries.
- **SSRF Prevention**: All HTTP actions validate destination IPs against private, loopback, link-local, and cloud metadata (`169.254.169.254`) ranges.
- **Safe Rule Engine**: Sandboxed AST evaluation without `eval()` or `new Function()`.
- **Secrets at Rest**: Encrypted with AES-256-GCM using 96-bit IVs and authentication tags.

---

## 📖 Documentation Links

- [Architecture Overview](file:///e:/ip/docs/architecture/overview.md)
- [API Documentation](file:///e:/ip/docs/api/openapi.md)
- [Deployment Guide](file:///e:/ip/docs/deployment/guide.md)
- [Security Checklist](file:///e:/ip/docs/security/checklist.md)
- [User Manual](file:///e:/ip/docs/user-guide/user-manual.md)
- [Developer & Plugin Guide](file:///e:/ip/docs/developer-guide/plugin-guide.md)
