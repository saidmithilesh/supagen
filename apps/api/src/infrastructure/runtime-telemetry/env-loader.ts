import { config as loadDotenv } from "dotenv";
import { expand } from "dotenv-expand";

import { getEnvFilePath } from "../../config/env";

export function loadRuntimeTelemetryEnv() {
  const result = loadDotenv({ path: getEnvFilePath(), override: false });
  expand(result);
}
