import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModelsCatalogPage } from "./models";

describe(ModelsCatalogPage.name, () => {
  it("renders the public models catalog shell", () => {
    render(<ModelsCatalogPage />);

    expect(
      screen.getByRole("heading", {
        name: "Catalog routes are ready for SEO pages.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
  });
});
