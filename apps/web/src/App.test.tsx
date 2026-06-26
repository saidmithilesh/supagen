import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe(App.name, () => {
  it("renders the workspace status", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "AI gateway workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByText("apps/api")).toBeInTheDocument();
    expect(screen.getByText("apps/web")).toBeInTheDocument();
    expect(screen.getByText("supagen-api")).toBeInTheDocument();
  });
});
