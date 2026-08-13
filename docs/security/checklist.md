# Security Architecture & OWASP Compliance Checklist

## Security Controls Implemented

1. **Multi-Tenant Isolation**:
   - Every database query requires explicit tenant context (`organizationId`).
   - Server-side authorization verification prevents Broken Object Level Authorization (BOLA/IDOR).

2. **SSRF Protection**:
   - All outgoing HTTP action URLs are validated against private IP ranges (`127.0.0.1`, `10.x`, `172.16.x`, `192.168.x`, `169.254.x`, link-local, and cloud metadata endpoints).
   - Prevents DNS rebinding attacks by resolving hostname before dispatch.

3. **AST Rule Engine Security**:
   - Zero dynamic code execution. `eval()` and `new Function()` are strictly forbidden.
   - Rules are parsed into AST nodes and safely evaluated using type-safe comparison functions.

4. **Secrets Encryption at Rest**:
   - Webhook secrets and integration credentials are encrypted at rest using AES-256-GCM with a 96-bit random IV and authentication tag.

5. **Webhook Security**:
   - HMAC-SHA256 signature verification with timing-safe comparison (`crypto.timingSafeEqual`).
   - Timestamp freshness tolerance check preventing replay attacks.
   - Idempotency key tracking in Redis preventing duplicate processing.

6. **Log Masking**:
   - Sensitive headers, passwords, bearer tokens, and API keys are automatically redacted in structured Pino logs.
