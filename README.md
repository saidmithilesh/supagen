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
pnpm typecheck
```

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

## API Environment

API env files live in `apps/api` and are gitignored.

```sh
cp apps/api/.env.example apps/api/.env.local
```

By default, the API loads `apps/api/.env.local`. When the Node process starts
with `NODE_ENV=production`, it loads `apps/api/.env.production` instead. Set
`SUPAGEN_API_ENV_FILE` to override the file name explicitly.
