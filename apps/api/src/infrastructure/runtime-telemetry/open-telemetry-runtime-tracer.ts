import { Injectable } from "@nestjs/common";
import {
  context,
  SpanStatusCode,
  trace,
  type Tracer,
} from "@opentelemetry/api";

import { RuntimeRequestContext } from "./runtime-request-context";
import type {
  RuntimeTelemetryAttributes,
  RuntimeTracer,
} from "./runtime-telemetry.types";
import { sanitizeRuntimeTelemetryAttributes } from "./redaction";

@Injectable()
export class OpenTelemetryRuntimeTracer implements RuntimeTracer {
  private readonly tracer: Tracer = trace.getTracer("supagen-api-runtime");

  constructor(private readonly requestContext: RuntimeRequestContext) {}

  async startActiveSpan<T>(
    name: string,
    attributes: RuntimeTelemetryAttributes,
    work: () => Promise<T>,
  ): Promise<T> {
    return this.tracer.startActiveSpan(
      name,
      { attributes: sanitizeRuntimeTelemetryAttributes(attributes) },
      async (span) => {
        try {
          return await work();
        } catch (error) {
          if (error instanceof Error) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
          } else {
            span.setStatus({ code: SpanStatusCode.ERROR });
          }

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  currentTraceContext() {
    const spanContext = trace.getSpan(context.active())?.spanContext();

    return {
      ...(this.requestContext.getRequestId()
        ? { requestId: this.requestContext.getRequestId() }
        : {}),
      ...(spanContext
        ? {
            traceId: spanContext.traceId,
            spanId: spanContext.spanId,
          }
        : {}),
    };
  }
}
