import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getEnvFilePath, validateEnv } from "./config/env";
import { IamModule } from "./domains/iam/iam.module";
import { ModelCatalogModule } from "./domains/model-catalog/model-catalog.module";
import { DatabaseModule } from "./infrastructure/database";
import { RuntimeTelemetryModule } from "./infrastructure/runtime-telemetry";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: getEnvFilePath(),
      expandVariables: true,
      isGlobal: true,
      validate: validateEnv,
    }),
    RuntimeTelemetryModule,
    DatabaseModule,
    IamModule,
    ModelCatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
