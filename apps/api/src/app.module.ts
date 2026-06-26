import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getEnvFilePath, validateEnv } from "./config/env";
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
