import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { configureApplication } from './common/bootstrap/app.bootstrap.js';
import { setupSwagger } from './common/bootstrap/swagger.bootstrap.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApplication(app);
  setupSwagger(app);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);

  console.log(
    `API running on http://localhost:${port}/api`,
  );

  console.log(
    `Swagger available on http://localhost:${port}/docs`,
  );
}

void bootstrap();