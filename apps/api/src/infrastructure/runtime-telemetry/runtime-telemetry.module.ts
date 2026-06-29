import {
  Global,
  MiddlewareConsumer,
  Module,
  type NestModule,
} from "@nestjs/common";

import {
  PINO_LOGGER,
  RUNTIME_LOGGER,
  RUNTIME_TELEMETRY_OPTIONS,
  RUNTIME_TRACER,
} from "./runtime-telemetry.constants";
import { resolveRuntimeTelemetryOptions } from "./runtime-telemetry-options";
import { createPinoLogger, PinoRuntimeLogger } from "./pino-runtime-logger";
import { OpenTelemetryRuntimeTracer } from "./open-telemetry-runtime-tracer";
import { RuntimeRequestContext } from "./runtime-request-context";
import { RuntimeRequestTelemetryMiddleware } from "./runtime-request-telemetry.middleware";
import { NestRuntimeLogger } from "./nest-runtime-logger";

@Global()
@Module({
  providers: [
    RuntimeRequestContext,
    RuntimeRequestTelemetryMiddleware,
    NestRuntimeLogger,
    {
      provide: RUNTIME_TELEMETRY_OPTIONS,
      useFactory: () => resolveRuntimeTelemetryOptions(process.env),
    },
    {
      provide: PINO_LOGGER,
      inject: [RUNTIME_TELEMETRY_OPTIONS],
      useFactory: createPinoLogger,
    },
    {
      provide: RUNTIME_LOGGER,
      useClass: PinoRuntimeLogger,
    },
    {
      provide: RUNTIME_TRACER,
      useClass: OpenTelemetryRuntimeTracer,
    },
  ],
  exports: [NestRuntimeLogger, RUNTIME_LOGGER, RUNTIME_TRACER],
})
export class RuntimeTelemetryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RuntimeRequestTelemetryMiddleware).forRoutes("*");
  }
}
