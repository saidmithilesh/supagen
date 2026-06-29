import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getEnvFilePath, validateEnv } from "./config/env";
import { IamModule } from "./domains/iam/iam.module";
import { DatabaseModule } from "./infrastructure/database";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: getEnvFilePath(),
      expandVariables: true,
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    IamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
