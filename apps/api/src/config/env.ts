import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url().optional(),
  SUPAGEN_API_ENV_FILE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnvFilePath() {
  const fileName =
    process.env.SUPAGEN_API_ENV_FILE ??
    (process.env.NODE_ENV === "production" ? ".env.production" : ".env.local");

  return join(getApiRootPath(), fileName);
}

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid API environment configuration: ${errors}`);
  }

  return result.data;
}

function getApiRootPath() {
  let currentPath = __dirname;

  while (!existsSync(join(currentPath, "nest-cli.json"))) {
    const parentPath = dirname(currentPath);

    if (parentPath === currentPath) {
      return process.cwd();
    }

    currentPath = parentPath;
  }

  return currentPath;
}
