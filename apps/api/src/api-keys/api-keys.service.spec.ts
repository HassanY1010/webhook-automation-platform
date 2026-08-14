import { ApiKeysService } from './api-keys.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { prisma } from '@webhook-auto/database';
import { hashApiKey } from '@webhook-auto/security';

jest.mock('@webhook-auto/database', () => ({
  prisma: {
    apiKey: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ApiKeysService Multi-Tenant Isolation & Authentication Suite', () => {
  let service: ApiKeysService;

  beforeEach(() => {
    service = new ApiKeysService();
    jest.clearAllMocks();
  });

  it('should generate a high-entropy API key starting with wh_live_ and store SHA-256 hash', async () => {
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({
      id: 'key_123',
      organizationId: 'org_A',
      userId: 'usr_1',
      name: 'CI/CD Key',
      prefix: 'wh_live_12345678...',
      scopes: ['*'],
      expiresAt: null,
      createdAt: new Date(),
      user: { id: 'usr_1', fullName: 'Alice', email: 'alice@test.com' },
    });

    const result = await service.createApiKey('org_A', 'usr_1', {
      name: 'CI/CD Key',
    });

    expect(result.apiKey).toBeDefined();
    expect(result.rawKey).toBeDefined();
    expect(result.rawKey.startsWith('wh_live_')).toBe(true);

    expect(prisma.apiKey.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_A',
          keyHash: hashApiKey(result.rawKey),
        }),
      }),
    );
  });

  it('should reject API key validation if key is revoked', async () => {
    const rawKey = 'wh_live_abcdef1234567890abcdef1234567890';
    const keyHash = hashApiKey(rawKey);

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 'key_1',
      keyHash,
      revokedAt: new Date(Date.now() - 10000), // Revoked
      expiresAt: null,
      organizationId: 'org_A',
      user: { id: 'usr_1', email: 'alice@test.com', fullName: 'Alice' },
    });

    await expect(service.validateApiKey(rawKey)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject API key validation if key is expired', async () => {
    const rawKey = 'wh_live_expired1234567890abcdef1234567890';
    const keyHash = hashApiKey(rawKey);

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 'key_2',
      keyHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() - 10000), // Expired in past
      organizationId: 'org_A',
      user: { id: 'usr_1', email: 'alice@test.com', fullName: 'Alice' },
    });

    await expect(service.validateApiKey(rawKey)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should successfully validate an active unexpired key and return authenticated context', async () => {
    const rawKey = 'wh_live_valid1234567890abcdef1234567890';
    const keyHash = hashApiKey(rawKey);

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 'key_3',
      keyHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000000),
      organizationId: 'org_A',
      userId: 'usr_1',
      user: { id: 'usr_1', email: 'alice@test.com', fullName: 'Alice' },
    });
    (prisma.apiKey.update as jest.Mock).mockResolvedValue({});

    const authContext = await service.validateApiKey(rawKey);
    expect(authContext).toBeDefined();
    expect(authContext.organizationId).toBe('org_A');
    expect(authContext.email).toBe('alice@test.com');
  });

  it('should prevent cross-tenant key revocation', async () => {
    (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.revokeApiKey('org_A', 'key_belonging_to_B'),
    ).rejects.toThrow(NotFoundException);
  });
});
