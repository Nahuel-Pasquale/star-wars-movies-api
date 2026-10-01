# Star Wars Movies API

Backend application built with **NestJS**, **TypeScript**, **PostgreSQL** and **TypeORM** for managing movies and synchronizing Star Wars films from **SWAPI**.

This project was developed as a technical challenge focused on backend architecture, authentication, authorization, testing, documentation, maintainability and clean code practices.

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

- `features`: application capabilities such as authentication, users and movies
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
│   └── movies/
│       ├── dto/
│       ├── entities/
│       ├── enums/
│       ├── types/
│       ├── tests/
│       ├── movies.controller.ts
│       ├── movies.service.ts
│       └── movies.module.ts
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

JWT_SECRET=development-secret-change-me
JWT_EXPIRES_IN=15m

SWAPI_BASE_URL=https://www.swapi.tech/api

ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=AdminPassword123
```

A `.env.example` file should be included in the repository as reference.

Do not commit real credentials or secrets.

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

The application uses PostgreSQL running inside Docker.

Default local database:

```text
star_wars_movies
```

Default local connection:

```text
Host: localhost
Port: 5432
Database: star_wars_movies
Username: postgres
Password: postgres
```

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

Public signup always creates a regular user.

Administrator accounts cannot be created by passing a role through the signup endpoint.

Create the configured administrator with:

```bash
npm run seed:admin
```

The seed uses:

```env
ADMIN_EMAIL
ADMIN_PASSWORD
```

The seed is idempotent and can be executed multiple times safely.

---

## Running the Application

Development mode:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000/api
```

Swagger documentation:

```text
http://localhost:3000/docs
```

---

## API Documentation

Swagger / OpenAPI documentation is available at:

```text
http://localhost:3000/docs
```

Protected endpoints support Bearer authentication directly from Swagger.

Use the **Authorize** button and provide a valid JWT token.

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
| POST `/api/auth/signup` | Yes | Yes | Yes |
| POST `/api/auth/login` | Yes | Yes | Yes |
| GET `/api/movies` | Yes | Yes | Yes |
| GET `/api/movies/:id` | No | Yes | No |
| POST `/api/movies` | No | No | Yes |
| PATCH `/api/movies/:id` | No | No | Yes |
| DELETE `/api/movies/:id` | No | No | Yes |
| POST `/api/movies/sync` | No | No | Yes |

The movie detail endpoint intentionally allows only regular users because that behavior follows the challenge specification literally.

---

## Endpoints

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Movies

```text
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies
PATCH  /api/movies/:id
DELETE /api/movies/:id
POST   /api/movies/sync
```

---

## SWAPI Synchronization

Movies can be synchronized from:

```text
https://www.swapi.tech
```

Endpoint:

```text
POST /api/movies/sync
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

Examples:

```text
400 Bad Request
Invalid input or malformed UUID

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
- SWAPI synchronization
- duplicate prevention during synchronization
- unchanged / updated synchronization behavior
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

### Idempotent Synchronization

SWAPI movies use their external identifier as a unique key.

Repeated synchronization therefore creates, updates or leaves records unchanged instead of generating duplicates.

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

# Create / ensure ADMIN user
npm run seed:admin

# Start development server
npm run start:dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage
npm run test:cov
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
http://localhost:3000/api
```

---

## Future Improvements

Possible improvements for a production environment include:

- refresh token flow
- token revocation strategy
- Redis-backed rate limiting
- caching
- transactional synchronization
- structured logging
- observability and tracing
- health checks
- CI/CD pipeline
- containerized backend deployment
- production secret management

---

## License

This project was created as a technical challenge / evaluation project.
