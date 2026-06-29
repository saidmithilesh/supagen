export type RuntimeTelemetryAttributeValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type RuntimeTelemetryAttributes = Record<
  string,
  RuntimeTelemetryAttributeValue
>;

export type RuntimeTraceContext = {
  requestId?: string;
  traceId?: string;
  spanId?: string;
};

export interface RuntimeLogger {
  debug(message: string, attributes?: RuntimeTelemetryAttributes): void;
  info(message: string, attributes?: RuntimeTelemetryAttributes): void;
  warn(
    message: string,
    attributes?: RuntimeTelemetryAttributes,
    error?: unknown,
  ): void;
  error(
    message: string,
    attributes?: RuntimeTelemetryAttributes,
    error?: unknown,
  ): void;
}

export interface RuntimeTracer {
  startActiveSpan<T>(
    name: string,
    attributes: RuntimeTelemetryAttributes,
    work: () => Promise<T>,
  ): Promise<T>;
  currentTraceContext(): RuntimeTraceContext;
}
