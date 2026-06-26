import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PricingPage } from "../components/marketing/PricingPage";
import { PrivacyPage } from "../components/marketing/PrivacyPage";
import { TermsPage } from "../components/marketing/TermsPage";

describe("marketing companion pages", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollTo", vi.fn());
  });

  it("renders pricing with the current auth route", () => {
    render(<PricingPage />);

    expect(
      screen.getByText("Every feature. Every plan. No surprises."),
    ).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Scale")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start Free" })).toHaveAttribute(
      "href",
      "/auth?mode=sign-up&redirect_url=/app",
    );
  });

  it("renders the legal pages", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: "Privacy Policy" }),
    ).toBeInTheDocument();

    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: "Terms & Conditions" }),
    ).toBeInTheDocument();
  });
});
