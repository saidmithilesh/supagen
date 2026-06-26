export type AuthMode = "sign-in" | "sign-up";

export function resolveAuthMode(mode: AuthMode, flowPath?: string): AuthMode {
  const firstFlowSegment = flowPath?.split("/")[0];

  if (firstFlowSegment === "verify-email-address") {
    return "sign-up";
  }

  return mode;
}
