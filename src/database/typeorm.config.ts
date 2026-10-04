import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  
  const ssl =
    configService.get<boolean>(
      'database.ssl',
    );

  return {
    type: 'postgres',

    host:
      configService.getOrThrow<string>('database.host'),

    port:
      configService.getOrThrow<number>('database.port'),

    database:
      configService.getOrThrow<string>('database.name'),

    username:
      configService.getOrThrow<string>('database.username'),

    password:
      configService.getOrThrow<string>('database.password'),

    ssl: ssl
      ? {
          rejectUnauthorized: false,
        }
      : false,

    autoLoadEntities: true,

    synchronize: false,

    logging: false,
  };
}