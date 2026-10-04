import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { Repository, DataSource } from 'typeorm';

import { SwapiClient } from '../../../integrations/swapi/swapi.client.js';
import { SwapiMapper } from '../../../integrations/swapi/swapi.mapper.js';
import { Movie } from '../entities/movie.entity.js';
import { MovieSource } from '../enums/movie-source.enum.js';
import { MoviesService } from '../movies.service.js';

describe('MoviesService - SWAPI sync', () => {
  let service: MoviesService;

  const repositoryMock = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    merge: vi.fn(),
  };

  const swapiClientMock = {
    getFilms: vi.fn(),
  };

  const swapiMapperMock = {
    toMovieData: vi.fn(),
  };

  const transactionRepositoryMock = {
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
  };

  const entityManagerMock = {
    getRepository: vi.fn(),
  };

  const dataSourceMock = {
    transaction: vi.fn(),
  };

  const film = {
    uid: '1',
    description: 'A movie',
    properties: {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
    },
  };

  const mappedMovie = {
    swapiId: '1',
    title: 'A New Hope',
    episodeId: 4,
    openingCrawl: 'It is a period...',
    director: 'George Lucas',
    producer: 'Gary Kurtz',
    releaseDate: '1977-05-25',
    source: MovieSource.SWAPI,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    entityManagerMock.getRepository.mockReturnValue(
      transactionRepositoryMock,
    );

    dataSourceMock.transaction.mockImplementation(
      async (callback) =>
        callback(entityManagerMock),
    );

    service = new MoviesService(
      repositoryMock as unknown as Repository<Movie>,
      dataSourceMock  as unknown as DataSource,
      swapiClientMock as unknown as SwapiClient,
      swapiMapperMock as unknown as SwapiMapper,
    );

    swapiClientMock.getFilms.mockResolvedValue([
      film,
    ]);

    swapiMapperMock.toMovieData.mockReturnValue(
      mappedMovie,
    );
  });

  it('should create movie when it does not exist', async () => {
    transactionRepositoryMock.find.mockResolvedValue(
      [],
    );

    transactionRepositoryMock.create.mockReturnValue(
      mappedMovie,
    );

    transactionRepositoryMock.save.mockResolvedValue(
      [mappedMovie],
    );

    const result =
      await service.syncFromSwapi();

    expect(
      dataSourceMock.transaction,
    ).toHaveBeenCalledTimes(1);

    expect(
      entityManagerMock.getRepository,
    ).toHaveBeenCalledWith(Movie);

    expect(
      transactionRepositoryMock.find,
    ).toHaveBeenCalledTimes(1);

    expect(
      transactionRepositoryMock.create,
    ).toHaveBeenCalledWith(
      mappedMovie,
    );

    expect(
      transactionRepositoryMock.save,
    ).toHaveBeenCalledWith([
      mappedMovie,
    ]);

    expect(result).toEqual({
      synced: 1,
      created: 1,
      updated: 0,
      unchanged: 0,
    });
  });

  it('should leave unchanged movie untouched', async () => {
    const existingMovie = {
      id: 'movie-id',
      ...mappedMovie,
    };

    transactionRepositoryMock.find.mockResolvedValue([
      existingMovie,
    ]);

    const result =
      await service.syncFromSwapi();

    expect(
      transactionRepositoryMock.create,
    ).not.toHaveBeenCalled();

    expect(
      transactionRepositoryMock.merge,
    ).not.toHaveBeenCalled();

    expect(
      transactionRepositoryMock.save,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      synced: 1,
      created: 0,
      updated: 0,
      unchanged: 1,
    });
  });

  it('should update movie when SWAPI data changed', async () => {
    const existingMovie = {
      id: 'movie-id',
      ...mappedMovie,
      title: 'Old title',
    };

    transactionRepositoryMock.find.mockResolvedValue([
      existingMovie,
    ]);

    transactionRepositoryMock.merge.mockImplementation(
      (target, source) =>
        Object.assign(target, source),
    );

    transactionRepositoryMock.save.mockResolvedValue([
      mappedMovie,
    ]);

    const result =
      await service.syncFromSwapi();

    expect(
      transactionRepositoryMock.merge,
    ).toHaveBeenCalledWith(
      existingMovie,
      mappedMovie,
    );

    expect(
      transactionRepositoryMock.save,
    ).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      synced: 1,
      created: 0,
      updated: 1,
      unchanged: 0,
    });
  });

  it('should create, update and keep unchanged movies in the same synchronization', async () => {
    const films = [
      {
        ...film,
        uid: '1',
      },
      {
        ...film,
        uid: '2',
      },
      {
        ...film,
        uid: '3',
      },
    ];

    const unchangedMovieData = {
      ...mappedMovie,
      swapiId: '1',
      title: 'Movie 1',
      episodeId: 1,
    };

    const updatedMovieData = {
      ...mappedMovie,
      swapiId: '2',
      title: 'Movie 2 Updated',
      episodeId: 2,
    };

    const newMovieData = {
      ...mappedMovie,
      swapiId: '3',
      title: 'Movie 3',
      episodeId: 3,
    };

    const existingUnchanged = {
      id: 'movie-1',
      ...unchangedMovieData,
    };

    const existingToUpdate = {
      id: 'movie-2',
      ...updatedMovieData,
      title: 'Old Movie 2',
    };

    swapiClientMock.getFilms.mockResolvedValue(
      films,
    );

    swapiMapperMock.toMovieData
      .mockReturnValueOnce(
        unchangedMovieData,
      )
      .mockReturnValueOnce(
        updatedMovieData,
      )
      .mockReturnValueOnce(
        newMovieData,
      );

    transactionRepositoryMock.find.mockResolvedValue([
      existingUnchanged,
      existingToUpdate,
    ]);

    transactionRepositoryMock.create.mockImplementation(
      (movie) => movie,
    );

    transactionRepositoryMock.merge.mockImplementation(
      (target, source) =>
        Object.assign(target, source),
    );

    transactionRepositoryMock.save.mockImplementation(
      async (movies) => movies,
    );

    const result =
      await service.syncFromSwapi();

    expect(result).toEqual({
      synced: 3,
      created: 1,
      updated: 1,
      unchanged: 1,
    });

    expect(
      transactionRepositoryMock.create,
    ).toHaveBeenCalledTimes(1);

    expect(
      transactionRepositoryMock.merge,
    ).toHaveBeenCalledTimes(1);

    expect(
      transactionRepositoryMock.save,
    ).toHaveBeenCalledTimes(1);
  });

  it('should return empty result when SWAPI returns no movies', async () => {
    swapiClientMock.getFilms.mockResolvedValue(
      [],
    );

    const result =
      await service.syncFromSwapi();

    expect(result).toEqual({
      synced: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    });

    expect(
      dataSourceMock.transaction,
    ).not.toHaveBeenCalled();
  });

  it('should propagate database errors from the transaction', async () => {
    transactionRepositoryMock.find.mockResolvedValue(
      [],
    );

    transactionRepositoryMock.create.mockReturnValue(
      mappedMovie,
    );

    transactionRepositoryMock.save.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.syncFromSwapi(),
    ).rejects.toThrow('Database error');

    expect(
      dataSourceMock.transaction,
    ).toHaveBeenCalledTimes(1);
  });
});