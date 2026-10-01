import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';
import { Movie } from './entities/movie.entity.js';
import { MoviesController } from './movies.controller.js';
import { MoviesService } from './movies.service.js';
import { SwapiModule } from '../../integrations/swapi/swapi.module.js';
@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    AuthModule,
    SwapiModule
  ],

  controllers: [
    MoviesController,
  ],

  providers: [
    MoviesService,
  ],

  exports: [
    MoviesService,
  ],
})
export class MoviesModule {}