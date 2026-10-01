import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SwapiClient } from './swapi.client.js';
import { SwapiMapper } from './swapi.mapper.js';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],

  providers: [
    SwapiClient,
    SwapiMapper,
  ],

  exports: [
    SwapiClient,
    SwapiMapper,
  ],
})
export class SwapiModule {}