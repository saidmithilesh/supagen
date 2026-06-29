import { randomUUID } from "node:crypto";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function resolveRequestId(
  value: string | string[] | undefined,
  generate: () => string = randomUUID,
) {
  const requestId = Array.isArray(value) ? value[0] : value;

  return requestId && isValidRequestId(requestId) ? requestId : generate();
}

export function isValidRequestId(value: string) {
  return REQUEST_ID_PATTERN.test(value);
}
