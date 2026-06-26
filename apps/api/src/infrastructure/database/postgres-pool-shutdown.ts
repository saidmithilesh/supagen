import { Inject, Injectable, type OnApplicationShutdown } from "@nestjs/common";
import type { Pool } from "pg";

import { POSTGRES_POOL } from "./database.constants";

@Injectable()
export class PostgresPoolShutdown implements OnApplicationShutdown {
  constructor(@Inject(POSTGRES_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
