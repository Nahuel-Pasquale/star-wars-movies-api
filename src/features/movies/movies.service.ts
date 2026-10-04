import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

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
    private readonly dataSource: DataSource,
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

  async findAll(
    page = 1,
    limit = 5,
  ) {
    const skip =
      (page - 1) * limit;

    const [data, totalCount] =
      await this.moviesRepository.findAndCount({
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    const totalPages =
      totalCount === 0
        ? 0
        : Math.ceil(totalCount / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage:
          totalPages > 0 &&
          page < totalPages,
        hasPreviousPage:
          page > 1 &&
          totalPages > 0,
      },
    };
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

    const mappedMovies = films.map((film) =>
      this.swapiMapper.toMovieData(film),
    );

    if (mappedMovies.length === 0) {
      return {
        synced: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
      };
    }

    return this.dataSource.transaction(
      async (manager) => {
        const moviesRepository =
          manager.getRepository(Movie);

        const swapiIds = mappedMovies.map(
          (movie) => movie.swapiId,
        );

        const existingMovies =
          await moviesRepository.find({
            where: {
              swapiId: In(swapiIds),
            },
          });

        const existingMoviesBySwapiId =
          new Map(
            existingMovies.map((movie) => [
              movie.swapiId,
              movie,
            ]),
          );

        const moviesToSave: Movie[] = [];

        let created = 0;
        let updated = 0;
        let unchanged = 0;

        for (const movieData of mappedMovies) {
          const existingMovie =
            existingMoviesBySwapiId.get(
              movieData.swapiId,
            );

          if (!existingMovie) {
            const movie =
              moviesRepository.create(
                movieData,
              );

            moviesToSave.push(movie);

            created++;

            continue;
          }

          if (
            !this.hasChanges(
              existingMovie,
              movieData,
            )
          ) {
            unchanged++;

            continue;
          }

          moviesRepository.merge(
            existingMovie,
            movieData,
          );

          moviesToSave.push(
            existingMovie,
          );

          updated++;
        }

        if (moviesToSave.length > 0) {
          await moviesRepository.save(
            moviesToSave,
          );
        }

        return {
          synced: mappedMovies.length,
          created,
          updated,
          unchanged,
        };
      },
    );
  }
}