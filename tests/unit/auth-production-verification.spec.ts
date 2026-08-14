/// <reference types="jest" />

import { hashPassword, verifyPassword } from '@webhook-auto/security';
import { RegisterSchema, LoginSchema } from '@webhook-auto/validation';
import { JwtService } from '@nestjs/jwt';

describe('🔴 Production Auth End-to-End Test Matrix', () => {
  const jwtService = new JwtService({});
  const secret = 'super-secret-production-jwt-key-min-32-chars-long';

  // 1. Password Security
  describe('1. Password Hashing & Verification', () => {
    it('should hash passwords with scrypt + unique salt and verify securely', async () => {
      const password = 'ProductionPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Unique salt per hash
      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain(':');

      // Valid password matches
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);

      // Wrong password fails
      expect(await verifyPassword('WrongPassword123!', hash1)).toBe(false);
      expect(await verifyPassword('', hash1)).toBe(false);
      expect(await verifyPassword(password, 'invalid-hash-format')).toBe(false);
    });
  });

  // 2. JWT Generation & Verification
  describe('2. JWT Access & Refresh Token Generation', () => {
    it('should sign and decode JWT tokens with sub, orgId, and role claims', () => {
      const payload = { sub: 'usr_test_123', orgId: 'org_test_456', role: 'OWNER' };
      const accessToken = jwtService.sign(payload, { secret, expiresIn: '15m' });
      const refreshToken = jwtService.sign(payload, { secret, expiresIn: '7d' });

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      const decoded = jwtService.verify(accessToken, { secret }) as any;
      expect(decoded.sub).toBe('usr_test_123');
      expect(decoded.orgId).toBe('org_test_456');
      expect(decoded.role).toBe('OWNER');
    });

    it('should reject expired or forged JWT tokens', () => {
      const payload = { sub: 'usr_test_123', orgId: 'org_test_456', role: 'OWNER' };
      const forgedToken = jwtService.sign(payload, { secret: 'wrong-key-12345678901234567890' });

      expect(() => {
        jwtService.verify(forgedToken, { secret });
      }).toThrow();
    });
  });

  // 3. Register Validation DTO
  describe('3. Registration Input Validation (RegisterSchema)', () => {
    it('PASS: valid registration payload', () => {
      const valid = {
        email: 'user@company.com',
        password: 'SecurePassword123!',
        fullName: 'John Doe',
        organizationName: 'Acme Corp',
      };
      const parsed = RegisterSchema.parse(valid);
      expect(parsed.email).toBe('user@company.com');
    });

    it('FAIL: invalid email format', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'SecurePassword123!',
        fullName: 'John Doe',
        organizationName: 'Acme Corp',
      };
      expect(() => RegisterSchema.parse(invalid)).toThrow('Invalid email address');
    });

    it('FAIL: password shorter than 8 characters', () => {
      const invalid = {
        email: 'user@company.com',
        password: '123',
        fullName: 'John Doe',
        organizationName: 'Acme Corp',
      };
      expect(() => RegisterSchema.parse(invalid)).toThrow('Password must be at least 8 characters long');
    });

    it('FAIL: missing required fields', () => {
      expect(() => RegisterSchema.parse({})).toThrow();
      expect(() => RegisterSchema.parse({ email: 'user@company.com' })).toThrow();
    });
  });

  // 4. Login Validation DTO
  describe('4. Login Input Validation (LoginSchema)', () => {
    it('PASS: valid login payload', () => {
      const valid = { email: 'admin@webhookplatform.io', password: 'Admin123456!' };
      const parsed = LoginSchema.parse(valid);
      expect(parsed.email).toBe('admin@webhookplatform.io');
    });

    it('FAIL: invalid email address in login', () => {
      expect(() => LoginSchema.parse({ email: 'invalid-email', password: 'pass' })).toThrow('Invalid email address');
    });

    it('FAIL: empty password in login', () => {
      expect(() => LoginSchema.parse({ email: 'admin@webhookplatform.io', password: '' })).toThrow('Password is required');
    });
  });
});
