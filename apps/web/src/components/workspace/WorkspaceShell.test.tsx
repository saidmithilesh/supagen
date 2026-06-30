import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { WorkspaceOverviewPage } from "./WorkspaceShell";

describe(WorkspaceOverviewPage.name, () => {
  it("renders the expanded workspace sidebar with static workspace links", () => {
    render(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    expect(screen.getByLabelText("Supagen")).toHaveAttribute("href", "/app");
    expect(screen.getByText("Test Workspace 3")).toBeInTheDocument();
    expect(screen.getByText("Free plan")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/overview",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Templates" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/templates",
    );
    expect(screen.getByRole("link", { name: "API Keys" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/developer/api-keys",
    );
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/billing",
    );
    expect(
      screen.getByRole("main", { name: "Workspace overview" }),
    ).toBeEmptyDOMElement();
  });

  it("collapses the sidebar with local UI state only", async () => {
    const user = userEvent.setup();

    render(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    await user.click(screen.getByRole("button", { name: "Collapse" }));

    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  });
});
