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

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

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
        openingCrawl:
          dto.openingCrawl?.trim() ?? null,
        director:
          dto.director?.trim() ?? null,
        producer:
          dto.producer?.trim() ?? null,
        releaseDate:
          dto.releaseDate ?? null,
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
}