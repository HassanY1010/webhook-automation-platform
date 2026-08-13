import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from '@webhook-auto/database';
import { AuthUser, RoleName } from '@webhook-auto/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-access-token-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: any): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user session');
    }

    // Default to payload organization or user's first organization
    const orgId = payload.orgId || user.memberships[0]?.organizationId;
    const membership = user.memberships.find((m) => m.organizationId === orgId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      organizationId: orgId,
      role: (membership?.role as RoleName) || RoleName.VIEWER,
    };
  }
}
