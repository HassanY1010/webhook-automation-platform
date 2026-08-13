import * as crypto from 'crypto';

export interface WebhookVerificationOptions {
  payload: string | Buffer;
  signature: string;
  secret: string;
  timestamp?: string | number;
  toleranceSeconds?: number; // Default 300 seconds (5 minutes)
}

export function verifyHmacSignature(options: WebhookVerificationOptions): boolean {
  const { payload, signature, secret, timestamp, toleranceSeconds = 300 } = options;

  if (!signature || !secret) {
    return false;
  }

  // Replay Attack Protection: Validate timestamp freshness
  if (timestamp) {
    const tsNumber = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(tsNumber) || Math.abs(now - tsNumber) > toleranceSeconds) {
      return false; // Stale or future timestamp
    }
  }

  // Handle header formats like "t=123456,v1=sha256_hash" or raw sha256 hex
  let rawSignature = signature;
  if (signature.includes('v1=')) {
    const parts = signature.split(',');
    const v1Part = parts.find((p) => p.startsWith('v1='));
    if (v1Part) rawSignature = v1Part.replace('v1=', '');
  }

  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(timestamp ? `${timestamp}.${payload}` : payload)
    .digest('hex');

  try {
    const sigBuffer = Buffer.from(rawSignature.replace(/^sha256=/, ''), 'hex');
    const computedBuffer = Buffer.from(computedHmac, 'hex');

    if (sigBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, computedBuffer);
  } catch (err) {
    return false;
  }
}
