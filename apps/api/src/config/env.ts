import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  DATABASE_URL: z.url(),
  VALKEY_HOST: z.string().min(1),
  VALKEY_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  VALKEY_PASSWORD: z.string().min(1),
  VALKEY_URL: z.url(),
  CLERK_SECRET_KEY: optionalNonEmptyString,
  CLERK_JWT_KEY: optionalNonEmptyString,
  CLERK_AUTHORIZED_PARTIES: optionalNonEmptyString,
  CORS_ALLOWED_ORIGINS: optionalNonEmptyString,
  RUNTIME_TELEMETRY_ENABLED: optionalBoolean,
  RUNTIME_TELEMETRY_LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .optional(),
  RUNTIME_TELEMETRY_LOG_FORMAT: z.enum(["pretty", "json"]).optional(),
  RUNTIME_TELEMETRY_LOG_FILE: optionalNonEmptyString,
  OTEL_SERVICE_NAME: optionalNonEmptyString,
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: optionalUrl,
  OTEL_TRACES_SAMPLER: z
    .enum([
      "always_on",
      "always_off",
      "traceidratio",
      "parentbased_always_on",
      "parentbased_always_off",
      "parentbased_traceidratio",
    ])
    .optional(),
  OTEL_TRACES_SAMPLER_ARG: optionalNonEmptyString,
  SUPAGEN_API_ENV_FILE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnvFilePath() {
  const fileName =
    process.env.SUPAGEN_API_ENV_FILE ??
    (process.env.NODE_ENV === "production"
      ? ".env.production"
      : process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env.local");

  return join(getApiRootPath(), fileName);
}

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid API environment configuration: ${errors}`);
  }

  return result.data;
}

function getApiRootPath() {
  let currentPath = __dirname;

  while (!existsSync(join(currentPath, "nest-cli.json"))) {
    const parentPath = dirname(currentPath);

    if (parentPath === currentPath) {
      return process.cwd();
    }

    currentPath = parentPath;
  }

  return currentPath;
}
