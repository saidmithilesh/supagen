# Supagen

Supagen is a TypeScript monorepo managed with pnpm and Turborepo.

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- Corepack enabled
- pnpm `>=11.7.0`

This workspace was initialized locally with Node.js `v24.17.0`, Corepack `0.35.0`, and pnpm `11.7.0`.

## Workspace

- `apps/api`: NestJS backend
- `apps/web`: React + Vite frontend
- `packages/shared`: shared TypeScript types and utilities

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:integration:local
pnpm typecheck
pnpm db:check
```

## Project Conventions

These conventions are the default guidance for future coding agent sessions.

### API Module Organization

Backend code should be organized by domain under `apps/api/src/domains`. Each
domain owns its public module boundary and may contain subdomains when the
responsibility boundary is meaningful.

Use this layered shape inside a domain when the behavior justifies it:

```txt
domains/<domain>/
  <domain>.module.ts
  presentation/      # controllers and transport-specific DTOs
  application/       # use cases, orchestration, transaction boundaries
  domain/            # business rules, domain types, pure domain services
  infrastructure/    # repositories, Drizzle access, external clients
```

Do not make every folder a Nest module by default. Add submodules only when
they provide a real dependency-injection boundary or exported API. Keep
repositories private to their owning domain; other domains should call exported
application services or react to events.

### Application Services, Repositories, And Transactions

Controllers should stay thin. Application services own use cases and coordinate
domain services, repositories, permissions, and transactions. Repositories own
data access only and should not start business transactions themselves.

Cross-service database transactions should use the `UnitOfWork` provider from
`apps/api/src/infrastructure/database`. The top-level application use case starts
the Drizzle transaction and passes the transaction context or DB executor to all
participating services and repositories.

Avoid broad request-wide transactions, and never hold a Postgres transaction
open across calls to external systems. For work that continues outside the
database, prefer an outbox or saga-style follow-up after commit.

### Drizzle And Migrations

Drizzle schema files should live with the domain that owns the tables, for
example `apps/api/src/domains/**/**/*.schema.ts`. Do not centralize all schemas
into one shared schema folder.

Use one migration stream per database. For the API database, Drizzle Kit is
configured in `apps/api/drizzle.config.ts`, reads domain schema files with a
glob, and writes migrations to `apps/api/drizzle`.

The migration workflow is:

```sh
pnpm db:generate
# review generated SQL
pnpm db:migrate
```

Use `drizzle-kit push` only for short-lived local prototyping, not for shared
staging or production schema changes. Commit both schema changes and generated
migration files. Do not run migrations automatically from API application
startup.

### Config And Secrets

API env files live in `apps/api`. Track env templates such as
`apps/api/.env.example` and `apps/api/.env.test.example`; keep real env files
such as `apps/api/.env.local`, `apps/api/.env.test`, and
`apps/api/.env.production` gitignored. The API loads `.env.local` by default,
`.env.test` when `NODE_ENV=test`, `.env.production` when the Node process starts
with `NODE_ENV=production`, and an explicit file when `SUPAGEN_API_ENV_FILE` is
set.

Use Nest `ConfigModule` and `ConfigService` instead of reading `process.env`
throughout the codebase. Infrastructure modules, such as database or provider
client modules, should consume config and provide already-configured clients to
domain/application code.

### Local Infra Conventions

Run local infra with Docker Compose and run the API directly on the host for
fast iteration. Docker Compose should read `apps/api/.env.local`, making it the
local source of truth for both infra bootstrap values and API connection URLs.

Use the `supagen-infra` Compose project with explicit named volumes for normal
local development. Use the separate `supagen-test-infra` Compose project for
local integration tests. Test infra must not depend on the persistent
development volumes.

### Testing And CI

API tests should use Jest with `@nestjs/testing` so tests can exercise Nest's
dependency-injection model. Use Supertest for HTTP-level API tests.

Web and shared-package tests should use Vitest. Web component tests should use
Testing Library with jsdom.

Use `*.spec.ts` for API and shared unit tests, `*.test.ts`/`*.test.tsx` for web
unit tests, and `*.integration-spec.ts` or `*.integration-test.ts(x)` for
integration tests.

CI is a verification gate, not a deployment pipeline. It should install from the
lockfile, prepare the local API env file from `apps/api/.env.example`, and run
formatting, Drizzle checks, typechecking, linting, unit tests, and builds. CI
does not run integration tests.

## Testing Workflow

```sh
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:integration:local
pnpm test:watch
```

The API uses Jest with Nest testing utilities. The web and shared packages use
Vitest. Local integration tests use `.env.test` and the disposable test infra
stack.

## Commit Checks

Husky runs `pnpm precommit` before commits. The pre-commit hook uses
lint-staged to format staged files with Prettier and run ESLint fixes on staged
JS/TS files. Full typechecking, tests, and builds stay in CI and can be run
locally with the root verification commands.

## Database Workflow

Drizzle is wired for the API package. The database provider and transaction
helpers live in `apps/api/src/infrastructure/database`.

```sh
pnpm db:check
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

`pnpm db:check` validates the current migration metadata. There are no domain
schemas yet, so no table migrations are expected until a domain adds its first
`*.schema.ts` file.

## Local Infra

Local Postgres and Valkey run through Docker Compose under the
`supagen-infra` project. The API still runs directly on the host machine.

```sh
pnpm infra:up
pnpm infra:ps
pnpm infra:logs
pnpm infra:down
```

The containers bind to the default local ports:

- Postgres: `localhost:5432`
- Valkey: `localhost:6379`

Data is persisted in explicit Docker named volumes:

- `supagen-postgres-data`
- `supagen-valkey-data`

Use `pnpm infra:reset` only when you intentionally want to stop infra and
delete those volumes.

## Test Infra

Local integration tests use a separate Docker Compose project:

```sh
pnpm infra:test:up
pnpm test:integration
pnpm infra:test:down
```

`pnpm test:integration:local` runs those three steps and shuts down test infra
after the tests finish.

The test stack binds to separate local ports:

- Postgres: `localhost:15432`
- Valkey: `localhost:16379`

The test stack uses tmpfs-backed data and does not reuse the persistent local
development volumes.

## API Environment

API env files live in `apps/api` and are gitignored.

```sh
cp apps/api/.env.example apps/api/.env.local
cp apps/api/.env.test.example apps/api/.env.test
```

By default, the API loads `apps/api/.env.local`. When the Node process starts
with `NODE_ENV=test`, it loads `apps/api/.env.test`; with
`NODE_ENV=production`, it loads `apps/api/.env.production`. Set
`SUPAGEN_API_ENV_FILE` to override the file name explicitly.
