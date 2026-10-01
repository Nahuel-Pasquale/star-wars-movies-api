import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Movie title',
    example: 'The Empire Strikes Back',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description:
      'Episode number within the saga',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  episodeId?: number;

  @ApiPropertyOptional({
    description:
      'Opening crawl or introductory text of the movie',
    example:
      'It is a dark time for the Rebellion...',
  })
  @IsOptional()
  @IsString()
  openingCrawl?: string;

  @ApiPropertyOptional({
    description: 'Movie director',
    example: 'Irvin Kershner',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @ApiPropertyOptional({
    description:
      'Movie producer or producers',
    example: 'Gary Kurtz, Rick McCallum',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  producer?: string;

  @ApiPropertyOptional({
    description:
      'Movie release date in ISO 8601 format',
    example: '1980-05-17',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}