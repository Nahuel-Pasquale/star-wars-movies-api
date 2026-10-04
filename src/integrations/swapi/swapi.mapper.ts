import { Injectable } from '@nestjs/common';
import { MovieSource } from '../../features/movies/enums/movie-source.enum.js';
import { SwapiFilm } from './dto/swapi-film.dto.js';
import { MovieSyncData } from '../../features/movies/types/movie-sync-data.type.js';

@Injectable()
export class SwapiMapper {
  toMovieData(film: SwapiFilm): MovieSyncData {
    return {
      swapiId: film.uid,
      title: film.properties.title.trim(),
      episodeId: film.properties.episode_id,
      openingCrawl: film.properties.opening_crawl.trim(),
      director: film.properties.director.trim(),
      producer: film.properties.producer.trim(),
      releaseDate: film.properties.release_date,
      source: MovieSource.SWAPI,
    };
  }
}