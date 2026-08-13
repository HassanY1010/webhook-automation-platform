import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName, AuthUser } from '@webhook-auto/types';

const ROLE_HIERARCHY: Record<RoleName, number> = {
  [RoleName.OWNER]: 5,
  [RoleName.ADMIN]: 4,
  [RoleName.EDITOR]: 3,
  [RoleName.OPERATOR]: 2,
  [RoleName.VIEWER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user || !user.role) {
      throw new ForbiddenException('User missing required role permissions');
    }

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const hasRole = requiredRoles.some((role) => userLevel >= ROLE_HIERARCHY[role]);

    if (!hasRole) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
