import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { UserRole } from '../../users/enums/user-role.enum.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtServiceMock = {
    verifyAsync: vi.fn(),
  };

  const createExecutionContext = (
    authorization?: string,
  ): {
    context: ExecutionContext;
    request: {
      headers: {
        authorization?: string;
      };
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    };
  } => {
    const request = {
      headers: authorization
        ? {
            authorization,
          }
        : {},
    };

    const context = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(
          request,
        ),
      }),
    } as unknown as ExecutionContext;

    return {
      context,
      request,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new JwtAuthGuard(
      jwtServiceMock as unknown as JwtService,
    );
  });

  it('should reject access when authorization header is missing', async () => {
    const { context } =
      createExecutionContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(
      jwtServiceMock.verifyAsync,
    ).not.toHaveBeenCalled();
  });

  it('should reject access when token is invalid', async () => {
    jwtServiceMock.verifyAsync.mockRejectedValue(
      new Error('Invalid token'),
    );

    const { context } =
      createExecutionContext(
        'Bearer invalid-token',
      );

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(
      jwtServiceMock.verifyAsync,
    ).toHaveBeenCalledWith(
      'invalid-token',
    );
  });

  it('should authenticate user when token is valid', async () => {
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'user-id',
      email: 'user@test.com',
      role: UserRole.USER,
    });

    const {
      context,
      request,
    } = createExecutionContext(
      'Bearer valid-token',
    );

    const result =
      await guard.canActivate(context);

    expect(result).toBe(true);

    expect(
      jwtServiceMock.verifyAsync,
    ).toHaveBeenCalledWith(
      'valid-token',
    );

    expect(request.user).toEqual({
      id: 'user-id',
      email: 'user@test.com',
      role: UserRole.USER,
    });
  });

  it('should reject malformed authorization header', async () => {
    const { context } =
      createExecutionContext(
        'Basic some-token',
      );

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(
      jwtServiceMock.verifyAsync,
    ).not.toHaveBeenCalled();
  });
});