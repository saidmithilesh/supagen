import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  type Sampler,
} from "@opentelemetry/sdk-trace-base";

import { loadRuntimeTelemetryEnv } from "./env-loader";
import {
  resolveRuntimeTelemetryOptions,
  type RuntimeTelemetryOptions,
} from "./runtime-telemetry-options";

const globalState = globalThis as typeof globalThis & {
  __supagenRuntimeTelemetrySdk?: NodeSDK;
};

loadRuntimeTelemetryEnv();
startRuntimeTelemetry();

function startRuntimeTelemetry() {
  const options = resolveRuntimeTelemetryOptions(process.env);

  if (!options.enabled || globalState.__supagenRuntimeTelemetrySdk) {
    return;
  }

  const sdk = new NodeSDK({
    ...(options.tracesEndpoint
      ? {
          traceExporter: new OTLPTraceExporter({
            url: options.tracesEndpoint,
          }),
        }
      : {}),
    autoDetectResources: true,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-pg": {
          enhancedDatabaseReporting: false,
        },
      }),
    ],
    resource: resourceFromAttributes({
      "service.name": options.serviceName,
      "deployment.environment.name": options.environment,
    }),
    sampler: getSampler(options),
  });

  sdk.start();
  globalState.__supagenRuntimeTelemetrySdk = sdk;

  process.once("SIGTERM", () => {
    void sdk.shutdown().finally(() => process.exit(0));
  });

  process.once("SIGINT", () => {
    void sdk.shutdown().finally(() => process.exit(0));
  });
}

function getSampler(options: RuntimeTelemetryOptions): Sampler {
  if (options.tracesSampler === "always_on") {
    return new AlwaysOnSampler();
  }

  if (options.tracesSampler === "always_off") {
    return new AlwaysOffSampler();
  }

  if (options.tracesSampler === "traceidratio") {
    return new TraceIdRatioBasedSampler(options.tracesSamplerArg);
  }

  if (options.tracesSampler === "parentbased_always_on") {
    return new ParentBasedSampler({ root: new AlwaysOnSampler() });
  }

  if (options.tracesSampler === "parentbased_always_off") {
    return new ParentBasedSampler({ root: new AlwaysOffSampler() });
  }

  return new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(options.tracesSamplerArg),
  });
}
