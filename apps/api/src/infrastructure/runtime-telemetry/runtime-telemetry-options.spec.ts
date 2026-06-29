import { resolveRuntimeTelemetryOptions } from "./runtime-telemetry-options";

describe(resolveRuntimeTelemetryOptions.name, () => {
  it("enables local telemetry with log file and local OTLP defaults", () => {
    const options = resolveRuntimeTelemetryOptions({
      NODE_ENV: "development",
    });

    expect(options.enabled).toBe(true);
    expect(options.logFormat).toBe("pretty");
    expect(options.logLevel).toBe("debug");
    expect(options.logFile).toContain(".runtime/logs/api.jsonl");
    expect(options.tracesEndpoint).toBe("http://localhost:4318/v1/traces");
    expect(options.tracesSampler).toBe("parentbased_traceidratio");
    expect(options.tracesSamplerArg).toBe(1);
  });

  it("disables test telemetry by default", () => {
    const options = resolveRuntimeTelemetryOptions({ NODE_ENV: "test" });

    expect(options.enabled).toBe(false);
    expect(options.logFile).toBeUndefined();
    expect(options.tracesEndpoint).toBeUndefined();
  });

  it("allows explicit test telemetry", () => {
    const options = resolveRuntimeTelemetryOptions({
      NODE_ENV: "test",
      RUNTIME_TELEMETRY_ENABLED: "true",
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "http://localhost:4318/v1/traces",
    });

    expect(options.enabled).toBe(true);
    expect(options.tracesEndpoint).toBe("http://localhost:4318/v1/traces");
  });

  it("clamps sampler ratio", () => {
    expect(
      resolveRuntimeTelemetryOptions({
        NODE_ENV: "development",
        OTEL_TRACES_SAMPLER_ARG: "2",
      }).tracesSamplerArg,
    ).toBe(1);

    expect(
      resolveRuntimeTelemetryOptions({
        NODE_ENV: "development",
        OTEL_TRACES_SAMPLER_ARG: "-1",
      }).tracesSamplerArg,
    ).toBe(0);
  });
});
