import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { Repository } from 'typeorm';

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

  const film = {
    uid: '1',
    description: 'A movie',
    properties: {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl:
        'It is a period...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
    },
  };

  const mappedMovie = {
    swapiId: '1',
    title: 'A New Hope',
    episodeId: 4,
    openingCrawl:
      'It is a period...',
    director: 'George Lucas',
    producer: 'Gary Kurtz',
    releaseDate: '1977-05-25',
    source: MovieSource.SWAPI,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new MoviesService(
      repositoryMock as unknown as Repository<Movie>,
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
    repositoryMock.findOne.mockResolvedValue(
      null,
    );

    repositoryMock.create.mockReturnValue(
      mappedMovie,
    );

    repositoryMock.save.mockResolvedValue(
      mappedMovie,
    );

    const result =
      await service.syncFromSwapi();

    expect(result).toEqual({
      synced: 1,
      created: 1,
      updated: 0,
      unchanged: 0,
    });

    expect(
      repositoryMock.create,
    ).toHaveBeenCalledWith(
      mappedMovie,
    );
  });

  it('should leave unchanged movie untouched', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 'movie-id',
      ...mappedMovie,
    });

    const result =
      await service.syncFromSwapi();

    expect(result).toEqual({
      synced: 1,
      created: 0,
      updated: 0,
      unchanged: 1,
    });

    expect(
      repositoryMock.save,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMock.merge,
    ).not.toHaveBeenCalled();
  });

  it('should update movie when SWAPI data changed', async () => {
    const existingMovie = {
      id: 'movie-id',
      ...mappedMovie,
      title: 'Old title',
    };

    repositoryMock.findOne.mockResolvedValue(
      existingMovie,
    );

    repositoryMock.merge.mockImplementation(
      (target, source) =>
        Object.assign(target, source),
    );

    repositoryMock.save.mockResolvedValue(
      mappedMovie,
    );

    const result =
      await service.syncFromSwapi();

    expect(result).toEqual({
      synced: 1,
      created: 0,
      updated: 1,
      unchanged: 0,
    });

    expect(
      repositoryMock.merge,
    ).toHaveBeenCalledWith(
      existingMovie,
      mappedMovie,
    );

    expect(
      repositoryMock.save,
    ).toHaveBeenCalled();
  });
});