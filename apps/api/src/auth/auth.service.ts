import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, RoleName } from '@webhook-auto/database';
import { hashPassword, verifyPassword } from '@webhook-auto/security';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
  }) {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    // Check for existing user first
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const safeOrgName = (data.organizationName || 'Default Org').trim();
    const slug =
      safeOrgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.floor(Math.random() * 100000);

    try {
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            fullName: data.fullName.trim(),
            passwordHash,
            isEmailVerified: true,
          },
        });

        const newOrg = await tx.organization.create({
          data: { name: safeOrgName, slug },
        });

        await tx.organizationMember.create({
          data: {
            organizationId: newOrg.id,
            userId: newUser.id,
            role: RoleName.OWNER,
          },
        });

        await tx.subscription.create({
          data: {
            organizationId: newOrg.id,
            planTier: 'FREE',
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        return { user: newUser, org: newOrg };
      });

      const tokens = this.generateTokens(
        result.user.id,
        result.org.id,
        RoleName.OWNER,
      );

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
        },
        organization: result.org,
        ...tokens,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw err;
    }
  }

  async login(data: { email: string; password: string }) {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    if (!normalizedEmail || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Ensure user has at least one organization membership
    let firstMembership = user.memberships?.[0];
    if (!firstMembership || !firstMembership.organization) {
      const fallbackOrg = await prisma.organization.findFirst();
      if (fallbackOrg) {
        firstMembership = await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: fallbackOrg.id,
            role: RoleName.OWNER,
          },
          include: { organization: true },
        });
      } else {
        const newOrg = await prisma.organization.create({
          data: {
            name: `${user.fullName || 'User'} Org`,
            slug: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          },
        });
        firstMembership = await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: newOrg.id,
            role: RoleName.OWNER,
          },
          include: { organization: true },
        });
      }
    }

    const tokens = this.generateTokens(
      user.id,
      firstMembership.organizationId,
      firstMembership.role,
    );

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: firstMembership.organization,
      role: firstMembership.role,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = String(
        process.env.JWT_REFRESH_SECRET ||
          'super-secret-refresh-token-key-change-in-production-min-32-chars',
      ).trim();

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
      return this.generateTokens(payload.sub, payload.orgId, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, orgId: string, role: string) {
    const payload = { sub: userId, orgId, role };
    const secret = String(
      process.env.JWT_SECRET ||
        'super-secret-access-token-key-change-in-production-min-32-chars',
    ).trim();
    const refreshSecret = String(
      process.env.JWT_REFRESH_SECRET ||
        'super-secret-refresh-token-key-change-in-production-min-32-chars',
    ).trim();

    // Read expiry from environment — honour configured values
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: accessExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}
