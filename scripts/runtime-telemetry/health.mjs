const args = new Set(process.argv.slice(2));
const storageOnly = args.has("--storage-only");

const endpoints = [
  ["loki", "http://localhost:3100/ready", true],
  ["tempo", "http://localhost:3200/ready", true],
  ["alloy", "http://localhost:12345/-/ready", !storageOnly],
];

const results = await Promise.all(
  endpoints.map(async ([name, url, required]) => {
    try {
      const response = await fetch(url);
      return {
        name,
        url,
        required,
        ok: response.ok,
        status: response.status,
        body: (await response.text()).slice(0, 200),
      };
    } catch (error) {
      return {
        name,
        url,
        required,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }),
);

console.log(JSON.stringify({ results }, null, 2));

if (results.some((result) => result.required && !result.ok)) {
  process.exitCode = 1;
}
