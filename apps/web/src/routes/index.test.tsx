import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingPage } from "./index";

describe(LandingPage.name, () => {
  it("renders the full public landing page", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: /The backend for your AI features & Agents/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Works with every major provider"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("One layer between your app and every LLM"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: /Start Building/i })[0],
    ).toHaveAttribute("href", "/auth?mode=sign-up&redirect_url=/app");
  });
});
