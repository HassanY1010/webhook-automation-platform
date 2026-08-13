import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleName } from '@webhook-auto/types';

describe('RolesGuard Audit & Authorization Test Suite', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: RoleName): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { id: 'usr_123', organizationId: 'org_123', role: userRole } : undefined,
        }),
      }),
    } as any;
  };

  it('should allow access if no roles are required on endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(RoleName.VIEWER);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow OWNER to access ADMIN / EDITOR / VIEWER endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.EDITOR]);
    const context = createMockContext(RoleName.OWNER);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow EDITOR to access EDITOR endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.EDITOR]);
    const context = createMockContext(RoleName.EDITOR);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should DENY VIEWER access to EDITOR / ADMIN endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.ADMIN]);
    const context = createMockContext(RoleName.VIEWER);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should DENY OPERATOR access to ADMIN / OWNER endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.ADMIN]);
    const context = createMockContext(RoleName.OPERATOR);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not authenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.VIEWER]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
