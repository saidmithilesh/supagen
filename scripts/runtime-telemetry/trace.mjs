const args = parseArgs(process.argv.slice(2));
const traceId = args["trace-id"];

if (!traceId) {
  throw new Error("Pass --trace-id <id>.");
}

const tempoUrl = process.env.TEMPO_URL ?? "http://localhost:3200";
const url = new URL(`/api/traces/${traceId}`, tempoUrl);
const response = await fetch(url);

if (!response.ok) {
  throw new Error(
    `Tempo query failed with ${response.status}: ${await response.text()}`,
  );
}

console.log(JSON.stringify(await response.json(), null, 2));

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
