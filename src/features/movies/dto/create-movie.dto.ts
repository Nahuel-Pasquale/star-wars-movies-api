import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  episodeId?: number;

  @IsOptional()
  @IsString()
  openingCrawl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  producer?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}