import * as crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) return false;
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedKeyBuffer = Buffer.from(keyHex, 'hex');
    if (derivedKey.length !== storedKeyBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, storedKeyBuffer);
  } catch {
    return false;
  }
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
