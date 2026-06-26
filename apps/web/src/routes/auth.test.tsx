import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AuthPanel, normalizeAuthSearch } from "./auth";

vi.mock("@clerk/tanstack-react-start", () => ({
  SignIn: ({
    fallbackRedirectUrl,
    forceRedirectUrl,
  }: {
    fallbackRedirectUrl?: string;
    forceRedirectUrl?: string;
  }) => (
    <div data-testid="clerk-sign-in">
      {fallbackRedirectUrl}:{forceRedirectUrl}
    </div>
  ),
  SignUp: ({
    fallbackRedirectUrl,
    forceRedirectUrl,
  }: {
    fallbackRedirectUrl?: string;
    forceRedirectUrl?: string;
  }) => (
    <div data-testid="clerk-sign-up">
      {fallbackRedirectUrl}:{forceRedirectUrl}
    </div>
  ),
}));

describe(normalizeAuthSearch.name, () => {
  it("defaults to sign-in and /app", () => {
    expect(normalizeAuthSearch({})).toEqual({
      mode: "sign-in",
      redirect_url: "/app",
    });
  });

  it("accepts sign-up and a redirect URL from search state", () => {
    expect(
      normalizeAuthSearch({
        mode: "sign-up",
        redirect_url: "/app",
      }),
    ).toEqual({
      mode: "sign-up",
      redirect_url: "/app",
    });
  });
});

describe(AuthPanel.name, () => {
  it("renders the Clerk sign-in component for sign-in mode", () => {
    render(
      <AuthPanel
        mode="sign-in"
        redirectUrl="/app"
        onModeChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to continue to Supagen"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Build AI features without wiring every provider by hand.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Supagen gives your product one control plane for prompts, model routing, keys, observability, usage, and end-user AI consumption.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("The AI Backend")).not.toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-in")).toHaveTextContent("/app:/app");
  });

  it("renders the Clerk sign-up component for sign-up mode", () => {
    render(
      <AuthPanel
        mode="sign-up"
        redirectUrl="/app"
        onModeChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Start building" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sign up to start building with Supagen"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-up")).toHaveTextContent("/app:/app");
  });

  it("emits mode changes from the tabs", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AuthPanel
        mode="sign-in"
        redirectUrl="/app"
        onModeChange={onModeChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Sign up" }));

    expect(onModeChange).toHaveBeenCalledWith("sign-up");
  });
});
