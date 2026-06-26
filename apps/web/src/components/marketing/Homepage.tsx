import "../../styles/homepage.css";

import { useSupagenTheme } from "../../theme/use-supagen-theme";
import { AgentTerminal } from "./AgentTerminal";
import { ArchDiagram } from "./ArchDiagram";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HomepageNav } from "./HomepageNav";
import { MarketingIcon } from "./MarketingIcon";
import { Pillars } from "./Pillars";
import { SocialProof } from "./SocialProof";
import { TrustBar } from "./TrustBar";

export function Homepage() {
  const { theme, cycleTheme } = useSupagenTheme();

  const handleAuthCtaClick = (
    section: string,
    ctaText: string,
    destination: string,
  ) => {
    void section;
    void ctaText;
    void destination;
  };

  const handleNavLinkClick = (
    section: string,
    linkText: string,
    destination: string,
  ) => {
    void section;
    void linkText;
    void destination;
  };

  return (
    <div className="homepage-root">
      <HomepageNav
        onAuthCtaClick={handleAuthCtaClick}
        onNavLinkClick={handleNavLinkClick}
      />
      <Hero
        onAuthCtaClick={handleAuthCtaClick}
        onNavLinkClick={handleNavLinkClick}
      />
      <TrustBar />
      <section className="section">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <div className="section-label">
            <MarketingIcon name="account_tree" style={{ fontSize: "18px" }} />
            What is Supagen
          </div>
          <div className="section-heading">
            One layer between your app and every LLM
          </div>
          <div className="section-subheading" style={{ margin: "0 auto" }}>
            One integration point for prompts, routing, observability, and cost
            tracking across every AI modality.
          </div>
          <ArchDiagram />
        </div>
      </section>
      <Pillars onAuthCtaClick={handleAuthCtaClick} />
      <AgentTerminal />
      <SocialProof />
      <FinalCta onAuthCtaClick={handleAuthCtaClick} />
      <Footer
        theme={theme}
        onCycleTheme={cycleTheme}
        onNavLinkClick={handleNavLinkClick}
      />
    </div>
  );
}
