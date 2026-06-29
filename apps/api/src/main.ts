import "./infrastructure/runtime-telemetry/bootstrap";

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";
import { NestRuntimeLogger } from "./infrastructure/runtime-telemetry";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(NestRuntimeLogger));

  const config = app.get(ConfigService);

  configureApp(app, {
    corsAllowedOrigins: parseCsv(config.get<string>("CORS_ALLOWED_ORIGINS")),
  });
  const port = config.get<number>("PORT") ?? 3000;

  await app.listen(port);
}

function parseCsv(value: string | undefined) {
  const values = value
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return values && values.length > 0 ? values : undefined;
}

void bootstrap();
