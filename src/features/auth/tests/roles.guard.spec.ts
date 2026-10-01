import {
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { UserRole } from '../../users/enums/user-role.enum.js';
import { RolesGuard } from '../guards/roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const reflectorMock = {
    getAllAndOverride: vi.fn(),
  };

  const createExecutionContext = (
    user?: {
      id: string;
      email: string;
      role: UserRole;
    },
  ): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),

      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          user,
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new RolesGuard(
      reflectorMock as unknown as Reflector,
    );
  });

  it('should allow access when no roles are required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(
      undefined,
    );

    const context =
      createExecutionContext();

    const result =
      guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow USER when USER role is required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      UserRole.USER,
    ]);

    const context =
      createExecutionContext({
        id: 'user-id',
        email: 'user@test.com',
        role: UserRole.USER,
      });

    const result =
      guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow ADMIN when ADMIN role is required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    const context =
      createExecutionContext({
        id: 'admin-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });

    const result =
      guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should reject USER when ADMIN role is required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    const context =
      createExecutionContext({
        id: 'user-id',
        email: 'user@test.com',
        role: UserRole.USER,
      });

    expect(() =>
      guard.canActivate(context),
    ).toThrow(ForbiddenException);
  });

  it('should reject access when authenticated user is missing', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    const context =
      createExecutionContext();

    expect(() =>
      guard.canActivate(context),
    ).toThrow(ForbiddenException);
  });
});