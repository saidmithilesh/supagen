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

## API Environment

API env files live in `apps/api` and are gitignored.

```sh
cp apps/api/.env.example apps/api/.env.local
```

By default, the API loads `apps/api/.env.local`. When the Node process starts
with `NODE_ENV=production`, it loads `apps/api/.env.production` instead. Set
`SUPAGEN_API_ENV_FILE` to override the file name explicitly.
