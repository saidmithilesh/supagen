import type {
  RuntimeTelemetryAttributes,
  RuntimeTelemetryAttributeValue,
} from "./runtime-telemetry.types";

const blockedAttributePatterns = [
  /authorization/i,
  /cookie/i,
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /session/i,
  /subject/i,
  /email/i,
  /prompt/i,
  /output/i,
  /payload/i,
  /body/i,
];

export function sanitizeRuntimeTelemetryAttributes(
  attributes: RuntimeTelemetryAttributes | undefined,
): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(attributes ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }

    sanitized[key] = isBlockedAttribute(key)
      ? "[redacted]"
      : toRuntimeTelemetryAttribute(value);
  }

  return sanitized;
}

function isBlockedAttribute(key: string) {
  return blockedAttributePatterns.some((pattern) => pattern.test(key));
}

function toRuntimeTelemetryAttribute(value: RuntimeTelemetryAttributeValue) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return String(value);
}
