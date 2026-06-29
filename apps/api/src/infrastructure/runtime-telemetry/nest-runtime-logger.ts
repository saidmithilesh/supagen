import { Inject, Injectable, type LoggerService } from "@nestjs/common";

import { RUNTIME_LOGGER } from "./runtime-telemetry.constants";
import type { RuntimeLogger } from "./runtime-telemetry.types";

@Injectable()
export class NestRuntimeLogger implements LoggerService {
  constructor(@Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger) {}

  log(message: unknown, context?: string): void {
    this.logger.info(String(message), nestAttributes(context));
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error(String(message), {
      ...nestAttributes(context),
      ...(trace ? { "error.stack": trace } : {}),
    });
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn(String(message), nestAttributes(context));
  }

  debug(message: unknown, context?: string): void {
    this.logger.debug(String(message), nestAttributes(context));
  }

  verbose(message: unknown, context?: string): void {
    this.logger.debug(String(message), {
      ...nestAttributes(context),
      "log.verbosity": "verbose",
    });
  }
}

function nestAttributes(context: string | undefined) {
  return context ? { "nest.context": context } : undefined;
}
