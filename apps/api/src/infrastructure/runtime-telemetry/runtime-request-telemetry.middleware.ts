import { Injectable, type NestMiddleware } from "@nestjs/common";

import { RuntimeRequestContext } from "./runtime-request-context";
import type { RuntimeLogger } from "./runtime-telemetry.types";
import { RUNTIME_LOGGER } from "./runtime-telemetry.constants";
import { Inject } from "@nestjs/common";
import { resolveRequestId } from "./request-id";
import { getActiveTraceContext, getActiveTraceparent } from "./trace-context";

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  originalUrl?: string;
  url?: string;
  path?: string;
  route?: { path?: string };
};

type ResponseLike = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  on(event: "finish", listener: () => void): void;
};

@Injectable()
export class RuntimeRequestTelemetryMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RuntimeRequestContext,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
  ) {}

  use(request: RequestLike, response: ResponseLike, next: () => void) {
    const requestId = resolveRequestId(request.headers["x-request-id"]);
    const start = process.hrtime.bigint();

    response.setHeader("x-request-id", requestId);

    const traceparent = getActiveTraceparent();

    if (traceparent) {
      response.setHeader("traceparent", traceparent);
    }

    this.requestContext.run({ requestId }, () => {
      response.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        const traceContext = getActiveTraceContext();

        this.logger.info("http_request_completed", {
          method: request.method,
          route: getRoute(request),
          statusCode: response.statusCode,
          durationMs: Number(durationMs.toFixed(3)),
          ...traceContext,
        });
      });

      next();
    });
  }
}

function getRoute(request: RequestLike) {
  return (
    request.route?.path ?? request.path ?? request.originalUrl ?? request.url
  );
}
