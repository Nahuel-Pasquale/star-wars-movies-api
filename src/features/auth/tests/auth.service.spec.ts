import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AuthService } from '../auth.service.js';
import { UsersService } from '../../users/users.service.js';
import { UserRole } from '../../users/enums/user-role.enum.js';

vi.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  const usersServiceMock = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const jwtServiceMock = {
    signAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService = new AuthService(
      usersServiceMock as unknown as UsersService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('signup', () => {
    it('should register a new user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(
        null,
      );

      vi.mocked(bcrypt.hash).mockResolvedValue(
        'hashed-password' as never,
      );

      usersServiceMock.create.mockReturnValue({
        email: 'user@test.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
      });

      usersServiceMock.save.mockResolvedValue({
        id: 'user-id',
        email: 'user@test.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
        createdAt: new Date(
          '2026-10-01T10:00:00.000Z',
        ),
      });

      const result =
        await authService.signup({
          email: ' USER@test.com ',
          password: 'Password123',
        });

      expect(
        usersServiceMock.findByEmail,
      ).toHaveBeenCalledWith(
        'user@test.com',
      );

      expect(bcrypt.hash)
        .toHaveBeenCalledWith(
          'Password123',
          12,
        );

      expect(
        usersServiceMock.create,
      ).toHaveBeenCalledWith({
        email: 'user@test.com',
        passwordHash: 'hashed-password',
      });

      expect(result).toEqual({
        id: 'user-id',
        email: 'user@test.com',
        role: UserRole.USER,
        createdAt: new Date(
          '2026-10-01T10:00:00.000Z',
        ),
      });
    });

    it('should reject duplicated email', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(
        authService.signup({
          email: 'user@test.com',
          password: 'Password123',
        }),
      ).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(bcrypt.hash)
        .not.toHaveBeenCalled();

      expect(
        usersServiceMock.save,
      ).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return JWT when credentials are valid', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'user@test.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
      });

      vi.mocked(
        bcrypt.compare,
      ).mockResolvedValue(
        true as never,
      );

      jwtServiceMock.signAsync.mockResolvedValue(
        'jwt-token',
      );

      const result =
        await authService.login({
          email: ' USER@test.com ',
          password: 'Password123',
        });

      expect(
        usersServiceMock.findByEmail,
      ).toHaveBeenCalledWith(
        'user@test.com',
      );

      expect(
        bcrypt.compare,
      ).toHaveBeenCalledWith(
        'Password123',
        'hashed-password',
      );

      expect(
        jwtServiceMock.signAsync,
      ).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'user@test.com',
        role: UserRole.USER,
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',
        tokenType: 'Bearer',
      });
    });

    it('should reject login when user does not exist', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(
        null,
      );

      await expect(
        authService.login({
          email: 'missing@test.com',
          password: 'Password123',
        }),
      ).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(bcrypt.compare)
        .not.toHaveBeenCalled();

      expect(
        jwtServiceMock.signAsync,
      ).not.toHaveBeenCalled();
    });

    it('should reject login when password is invalid', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'user@test.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
      });

      vi.mocked(
        bcrypt.compare,
      ).mockResolvedValue(
        false as never,
      );

      await expect(
        authService.login({
          email: 'user@test.com',
          password: 'WrongPassword123',
        }),
      ).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(
        jwtServiceMock.signAsync,
      ).not.toHaveBeenCalled();
    });
  });
});