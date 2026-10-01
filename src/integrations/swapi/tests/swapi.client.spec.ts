import {
  BadGatewayException,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  AxiosError,
  AxiosHeaders,
} from 'axios';
import { of, throwError } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SwapiClient } from '../swapi.client.js';


describe('SwapiClient', () => {
  let client: SwapiClient;

  const httpServiceMock = {
    get: vi.fn(),
  };

  const configServiceMock = {
    getOrThrow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    configServiceMock.getOrThrow.mockReturnValue(
      'https://www.swapi.tech/api',
    );

    client = new SwapiClient(
      httpServiceMock as unknown as HttpService,
      configServiceMock as unknown as ConfigService,
    );
  });

  it('should return films from SWAPI', async () => {
    const films = [
      {
        uid: '1',
        description: 'A Star Wars film',
        properties: {
          title: 'A New Hope',
          episode_id: 4,
          opening_crawl: 'It is a period...',
          director: 'George Lucas',
          producer: 'Gary Kurtz',
          release_date: '1977-05-25',
        },
      },
    ];

    httpServiceMock.get.mockReturnValue(
      of({
        data: {
          message: 'ok',
          result: films,
        },
      }),
    );

    const result =
      await client.getFilms();

    expect(result).toEqual(films);

    expect(
      httpServiceMock.get,
    ).toHaveBeenCalledWith(
      'https://www.swapi.tech/api/films',
    );
  });

  it('should throw GatewayTimeoutException on timeout', async () => {
    const error = new AxiosError(
      'timeout',
      'ECONNABORTED',
    );

    httpServiceMock.get.mockReturnValue(
      throwError(() => error),
    );

    await expect(
      client.getFilms(),
    ).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
  });

  it('should throw ServiceUnavailableException when SWAPI returns 5xx', async () => {
    const error = new AxiosError(
      'server error',
      undefined,
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
        data: {},
      },
    );

    httpServiceMock.get.mockReturnValue(
      throwError(() => error),
    );

    await expect(
      client.getFilms(),
    ).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('should throw BadGatewayException for other Axios errors', async () => {
    const error = new AxiosError(
      'bad request',
      undefined,
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
        data: {},
      },
    );

    httpServiceMock.get.mockReturnValue(
      throwError(() => error),
    );

    await expect(
      client.getFilms(),
    ).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('should throw BadGatewayException for unexpected errors', async () => {
    httpServiceMock.get.mockReturnValue(
      throwError(
        () => new Error('unexpected error'),
      ),
    );

    await expect(
      client.getFilms(),
    ).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});