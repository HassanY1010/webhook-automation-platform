import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from '@webhook-auto/database';
import { generateApiKey, hashApiKey } from '@webhook-auto/security';
import { AuthUser, RoleName } from '@webhook-auto/types';

@Injectable()
export class ApiKeysService {
  /**
   * Retrieves all API Keys for the organization (hashed keys remain masked).
   */
  async getApiKeys(organizationId: string) {
    const keys = await prisma.apiKey.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => {
      const isExpired = k.expiresAt ? new Date(k.expiresAt) < new Date() : false;
      const isRevoked = !!k.revokedAt;
      let status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' = 'ACTIVE';
      if (isRevoked) status = 'REVOKED';
      else if (isExpired) status = 'EXPIRED';

      return {
        id: k.id,
        organizationId: k.organizationId,
        name: k.name,
        prefix: k.prefix,
        scopes: k.scopes,
        status,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        revokedAt: k.revokedAt,
        createdAt: k.createdAt,
        createdBy: k.user,
      };
    });
  }

  /**
   * Creates a new API key with cryptographically secure high entropy.
   * Returns raw key ONCE ONLY upon creation.
   */
  async createApiKey(
    organizationId: string,
    userId: string,
    data: {
      name: string;
      expiresInDays?: number | null;
      scopes?: string[];
    },
  ) {
    const { rawKey, prefix, keyHash } = generateApiKey('live');

    let expiresAt: Date | null = null;
    if (data.expiresInDays && data.expiresInDays > 0) {
      expiresAt = new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId,
        userId,
        name: data.name.trim(),
        prefix,
        keyHash,
        scopes: data.scopes && data.scopes.length > 0 ? data.scopes : ['*'],
        expiresAt,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return {
      apiKey: {
        id: apiKey.id,
        organizationId: apiKey.organizationId,
        name: apiKey.name,
        prefix: apiKey.prefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        createdBy: apiKey.user,
      },
      rawKey, // Returned ONCE only
    };
  }

  /**
   * Revokes an active API Key with strict tenant isolation.
   */
  async revokeApiKey(organizationId: string, keyId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, organizationId },
    });

    if (!key) {
      throw new NotFoundException('API key not found or access denied');
    }

    const updated = await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return {
      success: true,
      message: 'API Key revoked successfully',
      id: updated.id,
      revokedAt: updated.revokedAt,
    };
  }

  /**
   * Permanently deletes an API Key.
   */
  async deleteApiKey(organizationId: string, keyId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, organizationId },
    });

    if (!key) {
      throw new NotFoundException('API key not found or access denied');
    }

    await prisma.apiKey.delete({ where: { id: keyId } });
    return { success: true, message: 'API Key deleted successfully' };
  }

  /**
   * Validates raw API Key and returns authenticated context.
   * Asynchronously updates lastUsedAt.
   */
  async validateApiKey(rawKey: string): Promise<AuthUser> {
    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException('Invalid API Key format');
    }

    const keyHash = hashApiKey(rawKey.trim());
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        organization: true,
        user: true,
      },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    if (apiKey.revokedAt) {
      throw new UnauthorizedException('API Key has been revoked');
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      throw new UnauthorizedException('API Key has expired');
    }

    // Update lastUsedAt asynchronously (non-blocking)
    prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return {
      id: apiKey.userId,
      email: apiKey.user.email,
      fullName: apiKey.user.fullName,
      organizationId: apiKey.organizationId,
      role: RoleName.OWNER,
    };
  }
}
