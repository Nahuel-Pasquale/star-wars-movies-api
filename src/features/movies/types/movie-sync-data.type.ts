import { MovieSource } from '../enums/movie-source.enum.js';

export interface MovieSyncData {
  swapiId: string;
  title: string;
  episodeId: number;
  openingCrawl: string;
  director: string;
  producer: string;
  releaseDate: string;
  source: MovieSource;
}