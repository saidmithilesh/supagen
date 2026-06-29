import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app, {
    corsAllowedOrigins: parseCsv(config.get<string>("CORS_ALLOWED_ORIGINS")),
  });
  const port = Number(process.env.PORT ?? 3000);

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
