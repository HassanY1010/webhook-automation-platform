import * as crypto from 'crypto';
import { encryptSecret } from './encryption';

/**
 * Generates a high-entropy API key.
 * Format: wh_live_<48-hex-chars>
 * Raw key is returned once to be shown to the user.
 * keyHash is stored in the database.
 */
export function generateApiKey(environment: 'live' | 'test' = 'live'): {
  rawKey: string;
  prefix: string;
  keyHash: string;
} {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `wh_${environment}_${randomBytes}`;
  const prefix = `wh_${environment}_${randomBytes.slice(0, 8)}...`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  return {
    rawKey,
    prefix,
    keyHash,
  };
}

/**
 * Generates a high-entropy Source Public Key and AES-256-GCM encrypted Webhook Secret.
 */
export function generateSourceCredentials(): {
  publicKey: string;
  rawSecret: string;
  encryptedSecret: string;
} {
  const publicKey = `src_${crypto.randomBytes(12).toString('hex')}`;
  const rawSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
  const encryptedSecret = encryptSecret(rawSecret);

  return {
    publicKey,
    rawSecret,
    encryptedSecret,
  };
}
