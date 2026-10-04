# Star Wars Movies API

Backend application built with **NestJS**, **TypeScript**, **PostgreSQL** and **TypeORM** for managing movies and synchronizing Star Wars films from **SWAPI**.

This project was developed as a technical challenge focused on backend architecture, authentication, authorization, testing, documentation, maintainability and clean code practices.

---

## Live Demo

The API is deployed and ready to be tested.

### API Base URL

```text
https://star-wars-movies-api-l4yb.onrender.com
```

### Swagger Documentation

```text
https://star-wars-movies-api-l4yb.onrender.com/docs
```

Swagger is the recommended way to test the application because it exposes all available endpoints and supports JWT Bearer authentication.

### Demo Administrator

A demo administrator account is already created in the deployed environment.

```text
Email: admin@starwars.dev
Password: Admin12345!
```

The administrator account can be used to test protected operations such as:

- creating movies
- updating movies
- deleting movies
- synchronizing movies from SWAPI

### Important: synchronize movies before testing

The deployed database may initially contain no movies.

Before testing the movie listing or movie detail endpoints, authenticate with the demo administrator and execute:

```http
POST /api/v1/movies/sync
```

This endpoint imports the Star Wars movies from SWAPI into the application database.

### Recommended Test Flow

1. Open Swagger.
2. Execute `POST /api/v1/auth/login`.
3. Login using the demo administrator credentials.
4. Copy the returned JWT access token.
5. Click **Authorize** in Swagger.
6. Provide the JWT token using Bearer authentication.
7. Execute `POST /api/v1/movies/sync`.
8. Test `GET /api/v1/movies?page=1&limit=5`.
9. Test the remaining protected endpoints.

These demo credentials are intentionally public and are intended exclusively for this technical challenge environment.

Infrastructure secrets such as database credentials, JWT secrets and hosting credentials are not stored in the repository.

---

## Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker / Docker Compose
- JWT
- bcrypt
- Swagger / OpenAPI
- Vitest
- Axios
- class-validator
- class-transformer
- Helmet
- NestJS Throttler

---

## Architecture

The project follows a **feature-oriented architecture**.

The main responsibilities are separated into:

- `features`: application capabilities such as authentication, users, movies and health checks
- `integrations`: external services such as SWAPI
- `database`: database configuration, migrations and seeds
- `config`: application configuration and environment validation
- `common`: shared infrastructure such as filters, bootstrap helpers and shared types

High-level request flow:

```text
HTTP Request
    |
    v
Controller
    |
    v
Service
    |
    +------> Repository / PostgreSQL
    |
    +------> External Integration
                 |
                 v
               SWAPI
```

SWAPI is accessed through a dedicated client and mapper so the application domain does not depend directly on the external API contract.

---

## Project Structure

```text
src/
├── common/
│   ├── bootstrap/
│   ├── filters/
│   └── types/
│
├── config/
│   ├── configuration.ts
│   └── env.validation.ts
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── data-source.ts
│   ├── database.module.ts
│   └── typeorm.config.ts
│
├── features/
│   ├── auth/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── types/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── types/
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── movies/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── types/
│   │   ├── tests/
│   │   ├── movies.controller.ts
│   │   ├── movies.service.ts
│   │   └── movies.module.ts
│   │
│   └── health/
│       ├── health.controller.ts
│       └── health.module.ts
│
├── integrations/
│   └── swapi/
│       ├── dto/
│       ├── swapi.client.ts
│       ├── swapi.mapper.ts
│       └── swapi.module.ts
│
├── app.module.ts
└── main.ts
```

---

## Requirements

Before running the project, make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

Optional database clients:

- DBeaver
- pgAdmin

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=star_wars_movies
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_SSL=false

JWT_SECRET=development-secret-change-me
JWT_EXPIRES_IN=15m

SWAPI_BASE_URL=https://www.swapi.tech/api

ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=AdminPassword123
```

> Never commit real credentials or secrets. Production values are configured through Render environment variables.

---

## Installation

Install dependencies:

```bash
npm install
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Verify the container is running:

```bash
docker compose ps
```

Expected service:

```text
star-wars-postgres
```

---

## Database

The application uses PostgreSQL.

For local development, PostgreSQL runs inside Docker.

Default local connection:

```text
Host: localhost
Port: 5432
Database: star_wars_movies
Username: postgres
Password: postgres
```

The deployed environment uses PostgreSQL hosted on Render. Production database credentials are configured only through environment variables and are not committed to the repository.

---

## Migrations

Database schema changes are managed through **TypeORM migrations**.

Run pending migrations:

```bash
npm run migration:run
```

Generate a migration:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

Revert the latest migration:

```bash
npm run migration:revert
```

The application uses:

```ts
synchronize: false
```

This avoids automatic schema changes and keeps database evolution explicit and versioned.

---

## Admin Seed

Public signup always creates a regular `USER`.

Administrator accounts cannot be created by passing a role through the signup endpoint.

For local development, an administrator can be created using:

```bash
npm run seed:admin
```

The seed reads:

```env
ADMIN_EMAIL
ADMIN_PASSWORD
```

The seed is idempotent and can be executed multiple times safely.

A demo administrator is already created in the deployed environment. Its credentials are listed in the [Live Demo](#live-demo) section.

---

## Running the Application

Development mode:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000/api/v1
```

Swagger documentation:

```text
http://localhost:3000/docs
```

---

## Health Check

The application exposes a lightweight liveness endpoint:

```http
GET /api/v1/health
```

The endpoint verifies that the API process is running and able to receive HTTP requests.

It intentionally does not depend on PostgreSQL or SWAPI, which makes it suitable for infrastructure health monitoring.

---

## API Documentation

Swagger / OpenAPI documentation is available locally at:

```text
http://localhost:3000/docs
```

and in the deployed environment at:

```text
https://star-wars-movies-api-l4yb.onrender.com/docs
```

Protected endpoints support Bearer authentication directly from Swagger.

Use the **Authorize** button and provide a valid JWT access token.

---

## Authentication & Authorization

Authentication is implemented with JWT access tokens.

JWT payload example:

```json
{
  "sub": "user-uuid",
  "email": "user@test.com",
  "role": "USER"
}
```

Supported roles:

```text
USER
ADMIN
```

Authentication and authorization are handled separately:

```text
JwtAuthGuard
     |
     v
Authenticated user
     |
     v
RolesGuard
     |
     v
Role validation
```

### Role Matrix

| Endpoint | Public | USER | ADMIN |
| --- | --- | --- | --- |
| POST `/api/v1/auth/signup` | Yes | Yes | Yes |
| POST `/api/v1/auth/login` | Yes | Yes | Yes |
| GET `/api/v1/movies` | Yes | Yes | Yes |
| GET `/api/v1/movies/:id` | No | Yes | No |
| POST `/api/v1/movies` | No | No | Yes |
| PATCH `/api/v1/movies/:id` | No | No | Yes |
| DELETE `/api/v1/movies/:id` | No | No | Yes |
| POST `/api/v1/movies/sync` | No | No | Yes |
| GET `/api/v1/health` | Yes | Yes | Yes |

The movie detail endpoint intentionally allows only regular users because that behavior follows the challenge specification literally.

---

## Endpoints

### Authentication

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

### Movies

```text
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies
PATCH  /api/movies/:id
DELETE /api/v1/movies/:id
POST   /api/movies/sync
```

### Health

```text
GET /api/v1/health
```

---

## Movie Pagination

`GET /api/v1/movies` returns a paginated response.

Default values:

```text
page=1
limit=5
```

Example request:

```http
GET /api/v1/movies?page=1&limit=5
```

Example response:

```json
{
  "data": [
    {
      "id": "movie-uuid",
      "title": "A New Hope"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "totalCount": 6,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

If no movies exist yet:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 5,
    "totalCount": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Query parameters are validated:

- `page` must be an integer greater than or equal to `1`
- `limit` must be an integer between `1` and `100`

---

## SWAPI Synchronization

Movies can be synchronized from:

```text
https://www.swapi.tech
```

Endpoint:

```text
POST /api/v1/movies/sync
```

Required role:

```text
ADMIN
```

Synchronization is based on the SWAPI movie identifier.

The `swapi_id` column has a unique constraint, preventing duplicate synchronized movies.

Example response:

```json
{
  "synced": 6,
  "created": 0,
  "updated": 0,
  "unchanged": 6
}
```

### Transactional Synchronization

The external SWAPI request and mapping are completed before opening the database transaction.

Inside the transaction, existing SWAPI movies are loaded in a single query and indexed in memory by `swapiId`. New or changed records are then persisted as a batch.

If any database operation fails while synchronizing the catalog, the transaction is rolled back and no partial synchronization is persisted.

Repeated synchronization is idempotent:

- missing movies are created
- changed movies are updated
- unchanged movies are left untouched

The SWAPI integration is isolated through:

```text
SwapiClient
    |
    v
SwapiMapper
    |
    v
MoviesService
```

This prevents external API models from leaking directly into the application domain.

---

## Error Handling

The API returns consistent HTTP status codes.

```text
400 Bad Request
Invalid input, invalid pagination parameters or malformed UUID

401 Unauthorized
Missing, invalid or expired authentication token

403 Forbidden
Authenticated user without sufficient permissions

404 Not Found
Requested movie does not exist

409 Conflict
Duplicated user email

429 Too Many Requests
Login rate limit exceeded

502 Bad Gateway
Unexpected SWAPI communication error

503 Service Unavailable
SWAPI unavailable

504 Gateway Timeout
SWAPI request timeout
```

A global exception filter is used to keep error responses consistent.

---

## Security

Implemented security measures include:

- bcrypt password hashing
- JWT authentication
- role-based authorization
- password never returned in API responses
- public signup cannot assign the `ADMIN` role
- environment-based secrets
- email normalization
- unique email database constraint
- database duplicate-key handling
- login rate limiting
- Helmet HTTP security headers
- DTO validation
- request payload whitelist
- rejection of unknown properties
- external API timeout handling
- production secrets kept outside the repository
- dependency audit with `0 vulnerabilities`

---

## Testing

Unit tests are implemented with **Vitest**.

Covered areas include:

- signup and login logic
- email normalization
- duplicated-user handling
- password hashing flow
- JWT generation
- JWT authentication guard
- role authorization guard
- user persistence behavior
- movie CRUD logic
- movie not-found behavior
- movie pagination behavior
- empty paginated results
- SWAPI synchronization
- transactional synchronization behavior
- create / update / unchanged synchronization cases
- duplicate prevention during synchronization
- SWAPI mapping
- SWAPI timeout and error handling

Run the complete test suite:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:cov
```

### Current Coverage

Current unit-test coverage is approximately:

```text
Statements: 96%+
Branches:   78%+
Functions:  96%+
Lines:      96%+
```

Coverage is focused on business logic and security-critical behavior instead of artificially testing framework metadata.

---

## Dependency Security

The project currently reports:

```text
0 vulnerabilities
```

Run:

```bash
npm audit
```

to verify the dependency tree.

---

## Design Decisions

### Feature-Oriented Architecture

Code is grouped by business capability instead of being globally separated into controllers, services and entities.

For example:

```text
features/movies/
```

contains the movie controller, service, DTOs, entities, types and related unit tests.

This keeps each feature cohesive and easier to navigate.

### PostgreSQL + TypeORM

PostgreSQL is used as the persistence layer.

TypeORM provides NestJS integration, repository-based persistence and explicit schema migrations.

### No Automatic Schema Synchronization

`TypeORM synchronize` is disabled.

All database schema changes are managed through migrations.

### SWAPI Adapter Layer

External SWAPI contracts are isolated from internal application models through `SwapiClient` and `SwapiMapper`.

This reduces coupling and makes the integration easier to test and replace.

### Exact Role Authorization

Roles are explicitly checked instead of implementing implicit role inheritance.

This allows the API to follow the challenge requirement where movie details are restricted specifically to regular users.

### Idempotent and Transactional Synchronization

SWAPI movies use their external identifier as a unique key.

The synchronization process:

1. fetches and maps the external data before opening the transaction
2. loads existing SWAPI movies in a single database query
3. compares existing and incoming data in memory
4. persists only new or changed movies
5. commits all database changes together

If persistence fails, the transaction is rolled back.

This avoids duplicate records, unnecessary updates and partially synchronized data.

### Paginated Movie Listing

Movie listing uses database-level pagination with TypeORM `findAndCount()`.

The API returns the current page data together with pagination metadata such as total records, total pages and next/previous-page availability.

The default page size is `5` to make pagination behavior visible in the demo environment.

### Database-Level Uniqueness

User email uniqueness is enforced by PostgreSQL in addition to application-level validation.

This protects the application from race conditions between concurrent signup requests.

### Fail-Fast Configuration

Environment variables are validated during application startup.

Missing required configuration causes the application to fail immediately instead of producing runtime errors later.

---

## Useful Commands

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Revert migration
npm run migration:revert

# Create / ensure ADMIN user locally
npm run seed:admin

# Start development server
npm run start:dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage
npm run test:cov

# Dependency security audit
npm audit
```

---

## Local Setup Summary

A clean local setup can be started with:

```bash
npm install
docker compose up -d
npm run migration:run
npm run seed:admin
npm run start:dev
```

Then open:

```text
Swagger:
http://localhost:3000/docs

API:
http://localhost:3000/api/v1

Health:
http://localhost:3000/api/v1/health
```

---

## Future Improvements

Possible improvements for a production environment include:

- refresh token flow
- token revocation strategy
- Redis-backed distributed rate limiting
- caching
- structured logging
- observability and tracing
- separate liveness and readiness probes
- CI/CD pipeline with automated quality gates
- automated migration strategy for production deployments
- integration / E2E tests
- secret rotation and centralized secret management

---

## License

This project was created as a technical challenge / evaluation project.
