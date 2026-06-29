import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import pino, { type Logger } from "pino";
import pretty from "pino-pretty";

import { PINO_LOGGER } from "./runtime-telemetry.constants";
import type { RuntimeTelemetryOptions } from "./runtime-telemetry-options";
import { RuntimeRequestContext } from "./runtime-request-context";
import type {
  RuntimeLogger,
  RuntimeTelemetryAttributes,
} from "./runtime-telemetry.types";
import { sanitizeRuntimeTelemetryAttributes } from "./redaction";
import { getActiveTraceContext } from "./trace-context";

export function createPinoLogger(options: RuntimeTelemetryOptions) {
  const streams: pino.StreamEntry[] = [
    {
      stream:
        options.logFormat === "pretty"
          ? pretty({
              colorize: true,
              ignore: "pid,hostname,service,env",
              translateTime: "SYS:standard",
            })
          : process.stdout,
    },
  ];

  if (options.logFile) {
    mkdirSync(dirname(options.logFile), { recursive: true });
    streams.push({ stream: pino.destination({ dest: options.logFile }) });
  }

  return pino(
    {
      base: {
        service: options.serviceName,
        env: options.environment,
      },
      enabled: options.enabled,
      formatters: {
        level: (label) => ({ level: label }),
      },
      level: options.logLevel,
      redact: {
        censor: "[redacted]",
        paths: [
          "authorization",
          "cookie",
          "*.authorization",
          "*.cookie",
          "req.headers.authorization",
          "req.headers.cookie",
          "headers.authorization",
          "headers.cookie",
          "apiKey",
          "secret",
          "password",
          "token",
          "sessionId",
          "providerSubject",
          "primaryEmail",
          "databaseUrl",
          "DATABASE_URL",
        ],
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream(streams),
  );
}

@Injectable()
export class PinoRuntimeLogger implements RuntimeLogger {
  constructor(
    @Inject(PINO_LOGGER) private readonly logger: Logger,
    private readonly requestContext: RuntimeRequestContext,
  ) {}

  debug(message: string, attributes?: RuntimeTelemetryAttributes): void {
    this.logger.debug(this.getFields(attributes), message);
  }

  info(message: string, attributes?: RuntimeTelemetryAttributes): void {
    this.logger.info(this.getFields(attributes), message);
  }

  warn(
    message: string,
    attributes?: RuntimeTelemetryAttributes,
    error?: unknown,
  ): void {
    this.logger.warn(this.getFields(attributes, error), message);
  }

  error(
    message: string,
    attributes?: RuntimeTelemetryAttributes,
    error?: unknown,
  ): void {
    this.logger.error(this.getFields(attributes, error), message);
  }

  private getFields(attributes?: RuntimeTelemetryAttributes, error?: unknown) {
    return {
      ...sanitizeRuntimeTelemetryAttributes(attributes),
      ...this.getContextFields(),
      ...(error instanceof Error
        ? { err: error }
        : error
          ? { error: String(error) }
          : {}),
    };
  }

  private getContextFields() {
    const requestId = this.requestContext.getRequestId();
    const traceContext = getActiveTraceContext();

    return {
      ...(requestId ? { requestId } : {}),
      ...traceContext,
    };
  }
}
