import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  Query
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MoviesService } from './movies.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List movies',
    description:
      'Returns a paginated list of movies.',
  })
  findAll(
    @Query()
    pagination: PaginationQueryDto,
  ) {
    return this.moviesService.findAll(
      pagination.page,
      pagination.limit,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get movie details',
    description:
      'Returns the details of a specific movie. This endpoint is restricted to regular users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movie retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid movie UUID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to access this resource',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Movie not found',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.USER)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.moviesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a movie',
    description:
      'Creates a new movie manually. Only administrators can access this endpoint.',
  })
  @ApiBody({
    type: CreateMovieDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Movie created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid movie data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Administrator role is required',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Body()
    dto: CreateMovieDto,
  ) {
    return this.moviesService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a movie',
    description:
      'Updates one or more fields of an existing movie. Only administrators can access this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateMovieDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movie updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid movie UUID or request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Administrator role is required',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Movie not found',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateMovieDto,
  ) {
    return this.moviesService.update(
      id,
      dto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a movie',
    description:
      'Deletes an existing movie. Only administrators can access this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Movie deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid movie UUID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Administrator role is required',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Movie not found',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<void> {
    await this.moviesService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Synchronize movies from SWAPI',
    description:
      'Retrieves the current Star Wars movie list from SWAPI and synchronizes it with the local database. Only administrators can access this endpoint.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movies synchronized successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token is missing or invalid',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Administrator role is required',
  })
  @ApiResponse({
    status: HttpStatus.BAD_GATEWAY,
    description: 'Unable to retrieve data from SWAPI',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'SWAPI is currently unavailable',
  })
  @ApiResponse({
    status: HttpStatus.GATEWAY_TIMEOUT,
    description: 'SWAPI request timed out',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('sync')
  syncFromSwapi() {
    return this.moviesService.syncFromSwapi();
  }
}