import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MovieSource } from '../enums/movie-source.enum.js';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'swapi_id',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  swapiId!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    name: 'episode_id',
    type: 'int',
    nullable: true,
  })
  episodeId!: number | null;

  @Column({
    name: 'opening_crawl',
    type: 'text',
    nullable: true,
  })
  openingCrawl!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  director!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  producer!: string | null;

  @Column({
    name: 'release_date',
    type: 'date',
    nullable: true,
  })
  releaseDate!: string | null;

  @Column({
    type: 'enum',
    enum: MovieSource,
    default: MovieSource.MANUAL,
  })
  source!: MovieSource;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}