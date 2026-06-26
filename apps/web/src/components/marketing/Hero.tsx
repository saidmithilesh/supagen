import { DashboardMock } from "./DashboardMock";

import { MarketingIcon } from "./MarketingIcon";
type HeroProps = {
  onAuthCtaClick?: (
    section: string,
    ctaText: string,
    destination: string,
  ) => void;
  onNavLinkClick?: (
    section: string,
    linkText: string,
    destination: string,
  ) => void;
};

export function Hero({ onAuthCtaClick, onNavLinkClick }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">
          <MarketingIcon name="bolt" style={{ fontSize: "16px" }} />
          The AI Backend
        </div>
        <h1>
          The backend for your <span>AI features & Agents</span>
        </h1>
        <p>
          Build faster without hardcoding prompts, model logic, and
          observability into your app.
        </p>
        <div className="hero-actions">
          <a
            className="btn-primary"
            href="/auth?mode=sign-up&redirect_url=/app"
            onClick={() => onAuthCtaClick?.("hero", "start_building", "signup")}
          >
            <MarketingIcon name="rocket_launch" style={{ fontSize: "20px" }} />
            Start Building
          </a>
          <a
            className="btn-secondary-outline"
            href="#how-it-works"
            onClick={() =>
              onNavLinkClick?.("hero", "connect_your_agent", "#how-it-works")
            }
          >
            Connect Your Agent
            <MarketingIcon name="arrow_downward" style={{ fontSize: "18px" }} />
          </a>
        </div>
      </div>
      <DashboardMock />
    </section>
  );
}
