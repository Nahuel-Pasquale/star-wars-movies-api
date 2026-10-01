import { SwapiFilm } from './swapi-film.dto.js';

export interface SwapiFilmsResponse {
  message: string;
  result: SwapiFilm[];
}