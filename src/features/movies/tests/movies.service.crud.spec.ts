import { NotFoundException } from '@nestjs/common';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  DataSource,
  Repository,
} from 'typeorm';

import { SwapiClient } from '../../../integrations/swapi/swapi.client.js';
import { SwapiMapper } from '../../../integrations/swapi/swapi.mapper.js';
import { Movie } from '../entities/movie.entity.js';
import { MovieSource } from '../enums/movie-source.enum.js';
import { MoviesService } from '../movies.service.js';

describe('MoviesService - CRUD', () => {
  let service: MoviesService;

  const repositoryMock = {
    find: vi.fn(),
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    merge: vi.fn(),
  };

  const dataSourceMock = {
    transaction: vi.fn(),
  };

  const swapiClientMock = {
    getFilms: vi.fn(),
  };

  const swapiMapperMock = {
    toMovieData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new MoviesService(
      repositoryMock as unknown as Repository<Movie>,
      dataSourceMock as unknown as DataSource,
      swapiClientMock as unknown as SwapiClient,
      swapiMapperMock as unknown as SwapiMapper,
    );
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const movies = [
        {
          id: 'movie-1',
          title: 'A New Hope',
        },
        {
          id: 'movie-2',
          title: 'The Empire Strikes Back',
        },
      ];

      repositoryMock.findAndCount.mockResolvedValue([
        movies,
        6,
      ]);

      const result =
        await service.findAll(1, 5);

      expect(
        repositoryMock.findAndCount,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual({
        data: movies,
        meta: {
          page: 1,
          limit: 5,
          totalCount: 6,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it('should calculate second page correctly', async () => {
      const movies = [
        {
          id: 'movie-6',
          title: 'Return of the Jedi',
        },
      ];

      repositoryMock.findAndCount.mockResolvedValue([
        movies,
        6,
      ]);

      const result =
        await service.findAll(2, 5);

      expect(
        repositoryMock.findAndCount,
      ).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual({
        data: movies,
        meta: {
          page: 2,
          limit: 5,
          totalCount: 6,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });

    it('should return empty pagination when there are no movies', async () => {
      repositoryMock.findAndCount.mockResolvedValue([
        [],
        0,
      ]);

      const result =
        await service.findAll(1, 5);

      expect(
        repositoryMock.findAndCount,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 5,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return movie when it exists', async () => {
      const movie = {
        id: 'movie-1',
        title: 'A New Hope',
      };

      repositoryMock.findOne.mockResolvedValue(
        movie,
      );

      const result =
        await service.findOne('movie-1');

      expect(result).toEqual(movie);
    });

    it('should throw when movie does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne('missing-id'),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a manual movie', async () => {
      const createdMovie = {
        id: 'movie-id',
        title: 'Interstellar',
        episodeId: null,
        openingCrawl: null,
        director: 'Christopher Nolan',
        producer: 'Emma Thomas',
        releaseDate: '2014-11-07',
        source: MovieSource.MANUAL,
        swapiId: null,
      };

      repositoryMock.create.mockReturnValue(
        createdMovie,
      );

      repositoryMock.save.mockResolvedValue(
        createdMovie,
      );

      const result =
        await service.create({
          title: ' Interstellar ',
          director: ' Christopher Nolan ',
          producer: ' Emma Thomas ',
          releaseDate: '2014-11-07',
        });

      expect(
        repositoryMock.create,
      ).toHaveBeenCalledWith({
        title: 'Interstellar',
        episodeId: null,
        openingCrawl: null,
        director: 'Christopher Nolan',
        producer: 'Emma Thomas',
        releaseDate: '2014-11-07',
        source: MovieSource.MANUAL,
        swapiId: null,
      });

      expect(result).toEqual(createdMovie);
    });
  });

  describe('update', () => {
    it('should update all optional movie fields', async () => {
      const existingMovie = {
        id: 'movie-id',
        title: 'Old title',
        episodeId: 1,
        openingCrawl: 'Old opening crawl',
        director: 'Old director',
        producer: 'Old producer',
        releaseDate: '2000-01-01',
        source: MovieSource.MANUAL,
        swapiId: null,
      };

      repositoryMock.findOne.mockResolvedValue(
        existingMovie,
      );

      repositoryMock.save.mockImplementation(
        async (movie) => movie,
      );

      const result =
        await service.update(
          'movie-id',
          {
            episodeId: 5,
            openingCrawl:
              ' Updated opening crawl ',
            producer:
              ' Updated producer ',
            releaseDate:
              '1980-05-17',
          },
        );

      expect(result.episodeId).toBe(5);

      expect(result.openingCrawl).toBe(
        'Updated opening crawl',
      );

      expect(result.producer).toBe(
        'Updated producer',
      );

      expect(result.releaseDate).toBe(
        '1980-05-17',
      );

      expect(
        repositoryMock.save,
      ).toHaveBeenCalledWith(
        existingMovie,
      );
    });

    it('should update title and director', async () => {
      const existingMovie = {
        id: 'movie-id',
        title: 'Old title',
        episodeId: 1,
        openingCrawl: 'Old opening crawl',
        director: 'Old director',
        producer: 'Old producer',
        releaseDate: '2000-01-01',
        source: MovieSource.MANUAL,
        swapiId: null,
      };

      repositoryMock.findOne.mockResolvedValue(
        existingMovie,
      );

      repositoryMock.save.mockImplementation(
        async (movie) => movie,
      );

      const result =
        await service.update(
          'movie-id',
          {
            title: ' New title ',
            director: ' New director ',
          },
        );

      expect(result.title).toBe(
        'New title',
      );

      expect(result.director).toBe(
        'New director',
      );

      expect(
        repositoryMock.save,
      ).toHaveBeenCalledWith(
        existingMovie,
      );
    });

    it('should throw when movie does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.update(
          'missing-id',
          {
            title: 'New title',
          },
        ),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing movie', async () => {
      const movie = {
        id: 'movie-id',
        title: 'A New Hope',
      };

      repositoryMock.findOne.mockResolvedValue(
        movie,
      );

      repositoryMock.remove.mockResolvedValue(
        movie,
      );

      await service.remove('movie-id');

      expect(
        repositoryMock.remove,
      ).toHaveBeenCalledWith(movie);
    });

    it('should throw when movie does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.remove('missing-id'),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});