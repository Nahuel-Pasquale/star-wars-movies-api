import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
): void {
  const config = new DocumentBuilder()
    .setTitle('Star Wars Movies API')
    .setDescription(
      'Backend API for managing and synchronizing movies with SWAPI',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'docs',
    app,
    document,
  );
}