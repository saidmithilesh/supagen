import { existsSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

export type RuntimeTelemetryLogLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "silent";

export type RuntimeTelemetryLogFormat = "pretty" | "json";

export type RuntimeTelemetrySampler =
  | "always_on"
  | "always_off"
  | "traceidratio"
  | "parentbased_always_on"
  | "parentbased_always_off"
  | "parentbased_traceidratio";

export type RuntimeTelemetryOptions = {
  enabled: boolean;
  environment: string;
  serviceName: string;
  logLevel: RuntimeTelemetryLogLevel;
  logFormat: RuntimeTelemetryLogFormat;
  logFile?: string;
  tracesEndpoint?: string;
  tracesSampler: RuntimeTelemetrySampler;
  tracesSamplerArg: number;
};

export function resolveRuntimeTelemetryOptions(
  env: NodeJS.ProcessEnv,
): RuntimeTelemetryOptions {
  const environment = env.NODE_ENV || "development";
  const enabled =
    parseBoolean(env.RUNTIME_TELEMETRY_ENABLED) ?? environment !== "test";
  const logFile = resolveLogFile(env.RUNTIME_TELEMETRY_LOG_FILE, environment);

  return {
    enabled,
    environment,
    serviceName: env.OTEL_SERVICE_NAME || "supagen-api",
    logLevel: parseLogLevel(env.RUNTIME_TELEMETRY_LOG_LEVEL, environment),
    logFormat: parseLogFormat(env.RUNTIME_TELEMETRY_LOG_FORMAT, environment),
    ...(logFile ? { logFile } : {}),
    tracesEndpoint: parseTracesEndpoint(
      env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
      environment,
    ),
    tracesSampler: parseSampler(env.OTEL_TRACES_SAMPLER),
    tracesSamplerArg: parseSamplerArg(env.OTEL_TRACES_SAMPLER_ARG),
  };
}

function parseBoolean(value: string | undefined) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (["1", "true", "yes", "on"].includes(value.toLowerCase())) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
}

function parseLogLevel(
  value: string | undefined,
  environment: string,
): RuntimeTelemetryLogLevel {
  const valid = new Set<RuntimeTelemetryLogLevel>([
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
    "silent",
  ]);

  return valid.has(value as RuntimeTelemetryLogLevel)
    ? (value as RuntimeTelemetryLogLevel)
    : environment === "production"
      ? "info"
      : "debug";
}

function parseLogFormat(
  value: string | undefined,
  environment: string,
): RuntimeTelemetryLogFormat {
  if (value === "pretty" || value === "json") {
    return value;
  }

  return environment === "production" ? "json" : "pretty";
}

function resolveLogFile(value: string | undefined, environment: string) {
  const logFile =
    value === ""
      ? undefined
      : value ||
        (environment === "development" ? ".runtime/logs/api.jsonl" : undefined);

  if (!logFile) {
    return undefined;
  }

  return isAbsolute(logFile) ? logFile : join(getWorkspaceRootPath(), logFile);
}

function parseTracesEndpoint(value: string | undefined, environment: string) {
  const endpoint =
    value === ""
      ? undefined
      : value ||
        (environment === "development"
          ? "http://localhost:4318/v1/traces"
          : undefined);

  if (!endpoint) {
    return undefined;
  }

  try {
    return new URL(endpoint).toString();
  } catch {
    return undefined;
  }
}

function parseSampler(value: string | undefined): RuntimeTelemetrySampler {
  const valid = new Set<RuntimeTelemetrySampler>([
    "always_on",
    "always_off",
    "traceidratio",
    "parentbased_always_on",
    "parentbased_always_off",
    "parentbased_traceidratio",
  ]);

  return valid.has(value as RuntimeTelemetrySampler)
    ? (value as RuntimeTelemetrySampler)
    : "parentbased_traceidratio";
}

function parseSamplerArg(value: string | undefined) {
  const parsed = Number(value ?? 1);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 0), 1);
}

function getWorkspaceRootPath() {
  let currentPath = process.cwd();

  while (!existsSync(join(currentPath, "pnpm-workspace.yaml"))) {
    const parentPath = dirname(currentPath);

    if (parentPath === currentPath) {
      return process.cwd();
    }

    currentPath = parentPath;
  }

  return currentPath;
}
