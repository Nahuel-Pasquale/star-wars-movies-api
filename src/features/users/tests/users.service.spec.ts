import {
  ConflictException,
} from '@nestjs/common';
import {
  QueryFailedError,
  Repository,
} from 'typeorm';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { UsersService } from '../users.service.js';
import { User } from '../entities/user.entity.js';
import { UserRole } from '../enums/user-role.enum.js';

describe('UsersService', () => {
  let service: UsersService;

  const repositoryMock = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new UsersService(
      repositoryMock as unknown as Repository<User>,
    );
  });

  describe('findByEmail', () => {
    it('should normalize email before searching', async () => {
      const user = {
        id: 'user-id',
        email: 'user@test.com',
      };

      repositoryMock.findOne.mockResolvedValue(
        user,
      );

      const result =
        await service.findByEmail(
          ' USER@test.com ',
        );

      expect(result).toEqual(user);

      expect(
        repositoryMock.findOne,
      ).toHaveBeenCalledWith({
        where: {
          email: 'user@test.com',
        },
      });
    });

    it('should return null when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(
        null,
      );

      const result =
        await service.findByEmail(
          'missing@test.com',
        );

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = {
        id: 'user-id',
        email: 'user@test.com',
      };

      repositoryMock.findOne.mockResolvedValue(
        user,
      );

      const result =
        await service.findById(
          'user-id',
        );

      expect(result).toEqual(user);

      expect(
        repositoryMock.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 'user-id',
        },
      });
    });
  });

  describe('create', () => {
    it('should create USER by default', () => {
      const data = {
        email: ' USER@test.com ',
        passwordHash: 'hashed-password',
      };

      repositoryMock.create.mockImplementation(
        (value) => value,
      );

      const result =
        service.create(data);

      expect(
        repositoryMock.create,
      ).toHaveBeenCalledWith({
        email: 'user@test.com',
        passwordHash:
          'hashed-password',
        role: UserRole.USER,
      });

      expect(result.role).toBe(
        UserRole.USER,
      );
    });

    it('should respect provided role', () => {
      repositoryMock.create.mockImplementation(
        (value) => value,
      );

      service.create({
        email: 'admin@test.com',
        passwordHash:
          'hashed-password',
        role: UserRole.ADMIN,
      });

      expect(
        repositoryMock.create,
      ).toHaveBeenCalledWith({
        email: 'admin@test.com',
        passwordHash:
          'hashed-password',
        role: UserRole.ADMIN,
      });
    });
  });

  describe('save', () => {
    it('should save user', async () => {
      const user = {
        id: 'user-id',
        email: 'user@test.com',
        passwordHash:
          'hashed-password',
        role: UserRole.USER,
      } as User;

      repositoryMock.save.mockResolvedValue(
        user,
      );

      const result =
        await service.save(user);

      expect(result).toEqual(user);

      expect(
        repositoryMock.save,
      ).toHaveBeenCalledWith(user);
    });

    it('should convert unique constraint violation into ConflictException', async () => {
      const user = {
        email: 'user@test.com',
      } as User;

      const error =
        new QueryFailedError(
          'INSERT',
          [],
          Object.assign(
            new Error(
              'duplicate key value',
            ),
            {
              code: '23505',
            },
          ),
        );

      repositoryMock.save.mockRejectedValue(
        error,
      );

      await expect(
        service.save(user),
      ).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should rethrow unexpected database errors', async () => {
      const user = {
        email: 'user@test.com',
      } as User;

      const error =
        new Error('database down');

      repositoryMock.save.mockRejectedValue(
        error,
      );

      await expect(
        service.save(user),
      ).rejects.toThrow(
        'database down',
      );
    });
  });
});