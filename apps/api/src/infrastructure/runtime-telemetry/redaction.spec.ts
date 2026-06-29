import { sanitizeRuntimeTelemetryAttributes } from "./redaction";

describe(sanitizeRuntimeTelemetryAttributes.name, () => {
  it("removes nullish values and preserves safe attributes", () => {
    expect(
      sanitizeRuntimeTelemetryAttributes({
        "iam.outcome": "bootstrap_created",
        userId: "user-id",
        skipped: undefined,
        nullable: null,
      }),
    ).toEqual({
      "iam.outcome": "bootstrap_created",
      userId: "user-id",
    });
  });

  it("redacts sensitive attributes by key", () => {
    expect(
      sanitizeRuntimeTelemetryAttributes({
        authorization: "Bearer token",
        primaryEmail: "user@example.com",
        providerSubject: "user_123",
      }),
    ).toEqual({
      authorization: "[redacted]",
      primaryEmail: "[redacted]",
      providerSubject: "[redacted]",
    });
  });
});
