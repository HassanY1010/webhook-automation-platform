import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService Forensic Audit Suite', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({});
    authService = new AuthService(jwtService);
  });

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
