import { resolveRequestId } from "./request-id";

describe(resolveRequestId.name, () => {
  it("preserves a valid request ID", () => {
    expect(resolveRequestId("request-123", () => "generated")).toBe(
      "request-123",
    );
  });

  it("uses the first valid request ID from a header array", () => {
    expect(resolveRequestId(["request-123"], () => "generated")).toBe(
      "request-123",
    );
  });

  it("generates a request ID when the header is missing", () => {
    expect(resolveRequestId(undefined, () => "generated")).toBe("generated");
  });

  it("generates a request ID when the header is invalid", () => {
    expect(resolveRequestId("not valid", () => "generated")).toBe("generated");
  });
});
