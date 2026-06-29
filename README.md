# Supagen

Supagen is a multi-modal AI gateway for early-stage product teams and solo
founders. It gives products one integration surface for text, image, audio, and
video generation while centralizing templates, provider routing, keys,
governance, observability, usage attribution, assets, and billing controls.

This repository is a TypeScript monorepo managed with pnpm and Turborepo.

## Workspace

- `apps/api`: NestJS backend
- `apps/web`: TanStack Start frontend
- `packages/shared`: shared TypeScript types and utilities
- `packages/ui`: shared shadcn/Tailwind UI primitives and design tokens

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- Corepack enabled
- pnpm `>=11.7.0`
- Docker Desktop or Docker Engine with Compose

## Local Setup

Install dependencies:

```sh
pnpm install
```

Create local environment files:

```sh
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

Replace placeholder values in the copied env files with the local development
keys and configuration values for your environment.

Start local Postgres and Valkey:

```sh
pnpm infra:up
```

Apply database migrations:

```sh
pnpm db:migrate
```

Run the development servers:

```sh
pnpm dev
```

By default, the API runs on `http://localhost:3000` and the web app runs on
`http://localhost:5173`.

Stop local infra when finished:

```sh
pnpm infra:down
```
