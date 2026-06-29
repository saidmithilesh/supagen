import { context, trace } from "@opentelemetry/api";

export function getActiveTraceContext() {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  if (!spanContext) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

export function getActiveTraceparent() {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  if (!spanContext) {
    return undefined;
  }

  const traceFlags = spanContext.traceFlags.toString(16).padStart(2, "0");

  return `00-${spanContext.traceId}-${spanContext.spanId}-${traceFlags}`;
}
