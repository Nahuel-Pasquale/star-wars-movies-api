import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
  ) {}

  @ApiOperation({
    summary: 'Check application health',
    description:
      'Checks whether the API is running and PostgreSQL is reachable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
  })
  @ApiResponse({
    status: 503,
    description:
      'Application or database dependency is unhealthy',
  })
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () =>
        this.database.pingCheck(
          'database',
        ),
    ]);
  }
}