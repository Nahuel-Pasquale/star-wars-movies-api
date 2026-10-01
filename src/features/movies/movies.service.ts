import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { Movie } from './entities/movie.entity.js';
import { MovieSource } from './enums/movie-source.enum.js';
import { SwapiClient } from '../../integrations/swapi/swapi.client.js';
import { SwapiMapper } from '../../integrations/swapi/swapi.mapper.js';
import { MovieSyncData } from './types/movie-sync-data.type.js';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly swapiClient: SwapiClient,
    private readonly swapiMapper: SwapiMapper,
    
  ) {}
  private hasChanges(
    movie: Movie,
    data: MovieSyncData,
  ): boolean {
    return (
      movie.title !== data.title ||
      movie.episodeId !== data.episodeId ||
      movie.openingCrawl !== data.openingCrawl ||
      movie.director !== data.director ||
      movie.producer !== data.producer ||
      movie.releaseDate !== data.releaseDate ||
      movie.source !== data.source
    );
  }

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Movie> {
    const movie =
      await this.moviesRepository.findOne({
        where: { id },
      });

    if (!movie) {
      throw new NotFoundException(
        'Movie not found',
      );
    }

    return movie;
  }

  async create(
    dto: CreateMovieDto,
  ): Promise<Movie> {
    const movie =
      this.moviesRepository.create({
        title: dto.title.trim(),
        episodeId: dto.episodeId ?? null,
        openingCrawl: dto.openingCrawl?.trim() ?? null,
        director: dto.director?.trim() ?? null,
        producer: dto.producer?.trim() ?? null,
        releaseDate: dto.releaseDate ?? null,
        source: MovieSource.MANUAL,
        swapiId: null,
      });

    return this.moviesRepository.save(movie);
  }

  async update(
    id: string,
    dto: UpdateMovieDto,
  ): Promise<Movie> {
    const movie = await this.findOne(id);

    if (dto.title !== undefined) {
      movie.title = dto.title.trim();
    }

    if (dto.episodeId !== undefined) {
      movie.episodeId = dto.episodeId;
    }

    if (dto.openingCrawl !== undefined) {
      movie.openingCrawl =
        dto.openingCrawl.trim();
    }

    if (dto.director !== undefined) {
      movie.director =
        dto.director.trim();
    }

    if (dto.producer !== undefined) {
      movie.producer =
        dto.producer.trim();
    }

    if (dto.releaseDate !== undefined) {
      movie.releaseDate =
        dto.releaseDate;
    }

    return this.moviesRepository.save(movie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findOne(id);

    await this.moviesRepository.remove(movie);
  }

  async syncFromSwapi() {
    const films =
      await this.swapiClient.getFilms();

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const film of films) {
      const data = this.swapiMapper.toMovieData(film);

      const existingMovie = await this.moviesRepository.findOne({
        where: {
          swapiId: data.swapiId,
        },
      });

      if (!existingMovie) {
        const movie = this.moviesRepository.create(data);
        await this.moviesRepository.save(movie);
        created++;
        continue;
      }

      if (!this.hasChanges(existingMovie, data)) {
        unchanged++;
        continue;
      }

      this.moviesRepository.merge(
        existingMovie,
        data,
      );

      await this.moviesRepository.save(
        existingMovie,
      );

      updated++;
    }

    return {
      synced: films.length,
      created,
      updated,
      unchanged,
    };
  }
}