import type { PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  RootProviders,
  SUPAGEN_META_DESCRIPTION,
  SUPAGEN_META_TITLE,
  SUPAGEN_SITE_URL,
  SUPAGEN_SOCIAL_IMAGE,
  X_CONVERSION_TRACKING_SCRIPT,
} from "./__root";

vi.mock("@clerk/tanstack-react-start", () => ({
  ClerkProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}));

vi.mock("@clerk/ui/themes", () => ({
  shadcn: {},
}));

describe(RootProviders.name, () => {
  it("renders children inside the Clerk and Query providers", () => {
    render(
      <RootProviders>
        <span>Provider child</span>
      </RootProviders>,
    );

    expect(screen.getByTestId("clerk-provider")).toBeInTheDocument();
    expect(screen.getByText("Provider child")).toBeInTheDocument();
  });
});

describe("root SEO and conversion tracking", () => {
  it("keeps the public social metadata aligned with the canonical site copy", () => {
    expect(SUPAGEN_META_TITLE).toBe(
      "Supagen — The Backend for AI Features & Agents",
    );
    expect(SUPAGEN_META_DESCRIPTION).toContain(
      "One integration point for prompts, routing, observability, and cost tracking across every LLM.",
    );
    expect(SUPAGEN_SITE_URL).toBe("https://supagen.dev/");
    expect(SUPAGEN_SOCIAL_IMAGE).toBe(
      "https://supagen.dev/supagen-og-image.png",
    );
  });

  it("includes the X conversion tracking bootstrap", () => {
    expect(X_CONVERSION_TRACKING_SCRIPT).toContain(
      "https://static.ads-twitter.com/uwt.js",
    );
    expect(X_CONVERSION_TRACKING_SCRIPT).toContain('twq("config", "rboc6")');
  });
});
