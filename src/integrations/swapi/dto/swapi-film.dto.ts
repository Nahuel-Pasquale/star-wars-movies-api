export interface SwapiFilmProperties {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
}

export interface SwapiFilm {
  uid: string;
  description: string;
  properties: SwapiFilmProperties;
}