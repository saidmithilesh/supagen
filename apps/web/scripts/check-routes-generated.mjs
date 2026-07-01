/* global URL, console, process */

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const routeTreePath = new URL("../src/routeTree.gen.ts", import.meta.url);
const before = readFileSync(routeTreePath, "utf8");
const result = spawnSync("tsr", ["generate"], {
  cwd: new URL("..", import.meta.url),
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const after = readFileSync(routeTreePath, "utf8");

if (before !== after) {
  console.error(
    "routeTree.gen.ts was stale. Re-run `pnpm --filter @supagen/web routes:generate` and commit the generated file.",
  );
  process.exit(1);
}
