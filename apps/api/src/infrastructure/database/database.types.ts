import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type DrizzleDatabase = NodePgDatabase;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDatabase["transaction"]>[0]
>[0];
export type DbExecutor = DrizzleDatabase | DrizzleTransaction;

export type TransactionContext = {
  db: DrizzleTransaction;
};
