import { verifyHmacSignature } from '@webhook-auto/security';
import * as crypto from 'crypto';

describe('HMAC Signature & Timestamp Verification Unit Tests', () => {
  const secret = 'super-secret-webhook-key';
  const payload = JSON.stringify({ itemId: '123', price: 300 });

  it('should verify valid HMAC signature', () => {
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const isValid = verifyHmacSignature({ payload, signature, secret });
    expect(isValid).toBe(true);
  });

  it('should reject invalid HMAC signature', () => {
    const isValid = verifyHmacSignature({ payload, signature: 'bad_signature_hex', secret });
    expect(isValid).toBe(false);
  });
});
