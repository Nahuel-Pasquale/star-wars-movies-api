import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  AxiosError,
  isAxiosError,
} from 'axios';
import { firstValueFrom } from 'rxjs';

import { SwapiFilm } from './dto/swapi-film.dto.js';
import { SwapiFilmsResponse } from './dto/swapi-films-response.dto.js';

@Injectable()
export class SwapiClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl =
      configService.getOrThrow<string>(
        'swapi.baseUrl',
      );
  }

  async getFilms(): Promise<SwapiFilm[]> {
    try {
      const response =
        await firstValueFrom(
          this.httpService.get<SwapiFilmsResponse>(
            `${this.baseUrl}/films`,
          ),
        );

      return response.data.result;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (!isAxiosError(error)) {
      throw new BadGatewayException(
        'Unexpected error communicating with SWAPI',
      );
    }

    const axiosError =
      error as AxiosError;

    if (axiosError.code === 'ECONNABORTED') {
      throw new GatewayTimeoutException(
        'SWAPI request timed out',
      );
    }

    if (
      axiosError.response?.status &&
      axiosError.response.status >= 500
    ) {
      throw new ServiceUnavailableException(
        'SWAPI is currently unavailable',
      );
    }

    throw new BadGatewayException(
      'Unable to retrieve data from SWAPI',
    );
  }
}