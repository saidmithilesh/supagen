import { config as loadEnv } from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

import { getEnvFilePath, validateEnv } from "./src/config/env";

expand(loadEnv({ path: getEnvFilePath() }));

const env = validateEnv(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/domains/**/*.schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
