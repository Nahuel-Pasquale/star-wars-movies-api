import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import helmet from 'helmet';

import { HttpExceptionFilter } from '../filters/http-exception.filter.js';

export function configureApplication(
  app: INestApplication,
): void {
  app.setGlobalPrefix('api');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );
}