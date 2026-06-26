import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE_DB } from "./database.constants";
import type { DrizzleDatabase, TransactionContext } from "./database.types";

@Injectable()
export class UnitOfWork {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async transaction<T>(
    work: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction((tx) => work({ db: tx }));
  }
}
