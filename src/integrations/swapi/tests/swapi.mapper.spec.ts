import {
  describe,
  expect,
  it,
} from 'vitest';
import { SwapiMapper } from '../swapi.mapper.js';
import { MovieSource } from '../../../features/movies/enums/movie-source.enum.js';

describe('SwapiMapper', () => {
  const mapper = new SwapiMapper();

  it('should map SWAPI film data to MovieSyncData', () => {
    const result = mapper.toMovieData({
      uid: '1',
      description: 'A Star Wars film',
      properties: {
        title: ' A New Hope ',
        episode_id: 4,
        opening_crawl:
          'It is a period of civil war...',
        director: ' George Lucas ',
        producer: ' Gary Kurtz ',
        release_date: '1977-05-25',
      },
    });

    expect(result).toEqual({
      swapiId: '1',
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl:
        'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      releaseDate: '1977-05-25',
      source: MovieSource.SWAPI,
    });
  });

  it('should always mark synchronized movies as SWAPI source', () => {
    const result = mapper.toMovieData({
      uid: '5',
      description: 'Another movie',
      properties: {
        title: 'The Empire Strikes Back',
        episode_id: 5,
        opening_crawl:
          'It is a dark time for the Rebellion...',
        director: 'Irvin Kershner',
        producer: 'Gary Kurtz',
        release_date: '1980-05-17',
      },
    });

    expect(result.source).toBe(
      MovieSource.SWAPI,
    );
  });
});