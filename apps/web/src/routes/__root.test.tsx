import type { PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RootProviders } from "./__root";

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
