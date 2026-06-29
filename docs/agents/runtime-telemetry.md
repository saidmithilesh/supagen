# Runtime Telemetry

Runtime telemetry is Supagen's internal service telemetry for engineers and agents. Do not call this observability; observability is reserved for customer-facing product capabilities around invocations.

## Instrumentation Rules

- Discuss what should be tracked with the user before adding or changing instrumentation.
- Add telemetry at application/use-case and external dependency seams. Do not instrument pure `domain/` code or every helper.
- Use `RuntimeLogger` and `RuntimeTracer` from `apps/api/src/infrastructure/runtime-telemetry`; do not call Pino, OpenTelemetry SDKs, Loki, Tempo, or vendor SDKs from domain/application code.
- Prefer low-cardinality attributes: `supagen.domain`, `supagen.use_case`, `iam.outcome`, `error.code`, `userId`, `organizationId`, and `workspaceId`.
- Include `requestId`, `traceId`, and `spanId` through the shared runtime telemetry infrastructure, not by hand where avoidable.
- Never emit raw prompts, outputs, provider payloads, request or response bodies, auth headers, cookies, API keys, database URLs, secrets, raw Clerk subjects/session IDs, or emails.
- Runtime telemetry is not the source of truth for audit logs, invocation logs, billing, or customer-facing product data.

## Local Machine-Readable Debugging

Start local telemetry storage and routing:

```sh
pnpm infra:telemetry:up
pnpm --filter @supagen/api dev
```

The API runs on the host. Dockerized Alloy reads host JSON logs from `.runtime/logs/api.jsonl` through a bind-mounted `.runtime/logs` directory and receives OTLP traces on `localhost:4318`.

Check local telemetry health:

```sh
pnpm telemetry:health
```

Check only Loki and Tempo storage health:

```sh
pnpm telemetry:health -- --storage-only
```

Fetch logs by request ID:

```sh
pnpm telemetry:logs -- --request-id <request-id>
```

Fetch logs by trace ID:

```sh
pnpm telemetry:logs -- --trace-id <trace-id>
```

Fetch a trace:

```sh
pnpm telemetry:trace -- --trace-id <trace-id>
```

## Debugging Recipes

For a failed HTTP request, start with the `x-request-id` response header, query logs by request ID, copy the `traceId` from the matching log entry, then fetch the trace by trace ID.

For IAM authentication failures, query logs by request ID and inspect `iam.outcome`. Expected outcomes are `unauthenticated`, `unsupported_principal`, `profile_not_bootstrapped`, `incomplete_profile`, `bootstrap_existing`, `bootstrap_created`, `bootstrap_repaired`, and `clerk_unavailable`.

For slow database behavior, fetch the trace by trace ID and inspect auto-instrumented Postgres spans. SQL parameter values must not be present in runtime telemetry.
