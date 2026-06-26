import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { DRIZZLE_DB, POSTGRES_POOL } from "./database.constants";
import { PostgresPoolShutdown } from "./postgres-pool-shutdown";
import { UnitOfWork } from "./unit-of-work";

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          connectionString: config.getOrThrow<string>("DATABASE_URL"),
        });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [POSTGRES_POOL],
      useFactory: (pool: Pool) => drizzle(pool),
    },
    PostgresPoolShutdown,
    UnitOfWork,
  ],
  exports: [DRIZZLE_DB, UnitOfWork],
})
export class DatabaseModule {}
