const args = parseArgs(process.argv.slice(2));
const requestId = args["request-id"];
const traceId = args["trace-id"];

if (!requestId && !traceId) {
  throw new Error("Pass --request-id <id> or --trace-id <id>.");
}

const field = requestId ? "requestId" : "traceId";
const value = requestId ?? traceId;
const lokiUrl = process.env.LOKI_URL ?? "http://localhost:3100";
const sinceMs = parseDurationMs(args.since ?? "1h");
const end = Date.now() * 1_000_000;
const start = (Date.now() - sinceMs) * 1_000_000;
const query = `{service="supagen-api"} | json | ${field}=${JSON.stringify(value)}`;
const url = new URL("/loki/api/v1/query_range", lokiUrl);
url.searchParams.set("query", query);
url.searchParams.set("start", String(start));
url.searchParams.set("end", String(end));
url.searchParams.set("direction", "forward");
url.searchParams.set("limit", String(args.limit ?? 200));

const response = await fetch(url);

if (!response.ok) {
  throw new Error(
    `Loki query failed with ${response.status}: ${await response.text()}`,
  );
}

const payload = await response.json();
const entries = [];

for (const stream of payload.data?.result ?? []) {
  for (const [timestamp, line] of stream.values ?? []) {
    entries.push({
      timestamp,
      labels: stream.stream,
      line: parseJsonLine(line),
    });
  }
}

console.log(JSON.stringify({ query, entries }, null, 2));

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (!arg.startsWith("--")) {
      continue;
    }

    parsed[arg.slice(2)] = argv[index + 1];
    index += 1;
  }

  return parsed;
}

function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return line;
  }
}

function parseDurationMs(value) {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)?$/.exec(value);

  if (!match) {
    throw new Error(
      "Invalid --since value. Use values like 30000ms, 30s, 15m, or 1h.",
    );
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "ms";
  const multipliers = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
  };

  return amount * multipliers[unit];
}
