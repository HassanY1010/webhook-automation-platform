import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { prisma, RoleName } from '@webhook-auto/database';
import { hashPassword, verifyPassword } from '@webhook-auto/security';

describe('AuthService Production Verification Suite', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({});
    authService = new AuthService(jwtService);
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT access & refresh tokens with org and role claims', () => {
      const serviceAny = authService as any;
      const tokens = serviceAny.generateTokens('usr_999', 'org_888', 'OWNER');

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decoded = jwtService.decode(tokens.accessToken) as any;
      expect(decoded.sub).toBe('usr_999');
      expect(decoded.orgId).toBe('org_888');
      expect(decoded.role).toBe('OWNER');
    });

    it('should throw UnauthorizedException when refresh token is invalid or malformed', async () => {
      await expect(authService.refreshToken('invalid-jwt-token-string')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Password Hashing & Verification', () => {
    it('should hash and verify passwords using scrypt with random salt', async () => {
      const password = 'ProductionSecurePass123!';
      const hash = await hashPassword(password);
      expect(hash).toContain(':');

      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);

      const isNotMatch = await verifyPassword('WrongPassword123!', hash);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Registration Logic', () => {
    it('should reject registration if email is missing', async () => {
      await expect(
        authService.register({
          email: '',
          password: 'Password123!',
          fullName: 'Test User',
          organizationName: 'Test Org',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Login Validation', () => {
    it('should throw BadRequestException when email or password is empty', async () => {
      await expect(
        authService.login({ email: '', password: 'Password123!' })
      ).rejects.toThrow(BadRequestException);

      await expect(
        authService.login({ email: 'test@example.com', password: '' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
