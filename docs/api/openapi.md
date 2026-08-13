# API Documentation & Endpoint Reference

Swagger OpenAPI UI is available at: `http://localhost:4000/api/docs`

## Core Endpoints

### 1. Authentication (`/auth`)
- `POST /auth/register` - Register user & organization workspace
- `POST /auth/login` - Authenticate and acquire JWT tokens
- `POST /auth/refresh` - Rotate refresh token
- `GET /auth/me` - Get current authenticated user profile & tenant scope

### 2. Webhook Ingestion (`/webhooks`)
- `POST /webhooks/:publicKey` - Fast asynchronous ingestion endpoint
  - Headers:
    - `X-Webhook-Signature`: HMAC-SHA256 signature
    - `X-Webhook-Timestamp`: Unix timestamp
    - `X-Idempotency-Key`: Unique idempotency key
  - Returns `202 Accepted`: `{ "success": true, "eventId": "evt_xxx", "status": "queued" }`

### 3. Bot Management (`/bots`)
- `POST /bots` - Create new automation bot
- `GET /bots` - List tenant bots
- `GET /bots/:id` - Get bot details & version history
- `PUT /bots/:id` - Update bot configuration (bumps version)
- `POST /bots/:id/toggle` - Activate / Pause bot
- `POST /bots/:id/rollback/:version` - Rollback bot to specified version

### 4. Executions & DLQ (`/executions`)
- `GET /executions` - List execution logs
- `GET /executions/dlq` - List Dead Letter Queue permanent failures
- `GET /executions/:id` - Get detailed step-by-step trace
- `POST /executions/:id/retry` - Manually retry failed execution

### 5. Testing & Sandbox (`/testing`)
- `POST /testing/send-test-event` - Run test simulation without side-effects
