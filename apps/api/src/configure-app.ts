import type { INestApplication } from "@nestjs/common";

export type ConfigureAppOptions = {
  corsAllowedOrigins?: string[];
};

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
) {
  app.setGlobalPrefix("api/v1");

  if (options.corsAllowedOrigins?.length) {
    app.enableCors({
      credentials: true,
      origin: options.corsAllowedOrigins,
    });
  }
}
