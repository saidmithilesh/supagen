import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingPage } from "./index";

describe(LandingPage.name, () => {
  it("renders the public landing shell", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: "One integration surface for AI generation.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse models/i }),
    ).toHaveAttribute("href", "/models");
  });
});
