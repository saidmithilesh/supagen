import "../../styles/homepage.css";

import { useSupagenTheme } from "../../theme/use-supagen-theme";
import { Footer } from "./Footer";
import { HomepageNav } from "./HomepageNav";
import { MarketingIcon } from "./MarketingIcon";

const signUpHref = "/auth?mode=sign-up&redirect_url=/app";

type AuthCtaMetadata = readonly [section: string, label: string, href: string];

type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  cta: {
    label: string;
    variant: "primary" | "secondary";
    disabled?: boolean;
    href?: string;
    analytics?: AuthCtaMetadata;
  };
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For trying things out and side projects",
    features: [
      "10,000 requests/month",
      "30-day log retention",
      "All features included",
      "Unlimited seats",
    ],
    cta: {
      label: "Start Free",
      href: signUpHref,
      variant: "primary",
      analytics: ["pricing_free", "start_free", "signup"],
    },
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For teams shipping AI features to production",
    badge: "Coming soon",
    featured: true,
    features: [
      "100,000 requests/month",
      "90-day log retention",
      "All features included",
      "Unlimited seats",
    ],
    cta: {
      label: "Get Started",
      disabled: true,
      variant: "primary",
    },
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For high-volume and enterprise needs",
    features: [
      "Custom request volume",
      "Custom log retention",
      "All features included",
      "Unlimited seats",
    ],
    cta: {
      label: "Contact Us",
      href: "mailto:support@supagen.dev",
      variant: "secondary",
      analytics: ["pricing_scale", "contact_us", "mailto:support@supagen.dev"],
    },
  },
];

export function PricingPage() {
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

  const handlePricingCtaClick = (analytics?: AuthCtaMetadata) => {
    if (!analytics) {
      return;
    }

    const [section, label, href] = analytics;

    if (href === "signup") {
      handleAuthCtaClick(section, label, href);
      return;
    }

    handleNavLinkClick(section, label, href);
  };

  return (
    <div className="homepage-root">
      <HomepageNav
        onAuthCtaClick={handleAuthCtaClick}
        onNavLinkClick={handleNavLinkClick}
      />

      <section className="section pricing-section" id="pricing">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <div className="section-label">
            <MarketingIcon name="payments" style={{ fontSize: "18px" }} />
            Pricing
          </div>
          <div className="section-heading">
            Every feature. Every plan. No surprises.
          </div>
          <div className="section-subheading" style={{ margin: "0 auto 3rem" }}>
            All features included on every tier. No per-seat pricing. Just pick
            the request volume you need.
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <div
                className={
                  "featured" in plan && plan.featured
                    ? "pricing-card pricing-card--featured"
                    : "pricing-card"
                }
                key={plan.name}
              >
                {"badge" in plan && plan.badge ? (
                  <div className="pricing-card-badge">{plan.badge}</div>
                ) : null}
                <div className="pricing-card-header">
                  <div className="pricing-tier-name">{plan.name}</div>
                  <div className="pricing-price">
                    <span className="pricing-amount">{plan.price}</span>
                    {"period" in plan && plan.period ? (
                      <span className="pricing-period">{plan.period}</span>
                    ) : null}
                  </div>
                  <div className="pricing-description">{plan.description}</div>
                </div>
                <div className="pricing-card-body">
                  <ul className="pricing-features">
                    {plan.features.map((feature) => (
                      <li className="pricing-feature" key={feature}>
                        <MarketingIcon
                          name="check_circle"
                          style={{ fontSize: "18px" }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-card-footer">
                  {plan.cta.disabled ? (
                    <button className="btn-primary pricing-btn" disabled>
                      {plan.cta.label}
                    </button>
                  ) : (
                    <a
                      className={
                        plan.cta.variant === "primary"
                          ? "btn-primary pricing-btn"
                          : "btn-secondary-outline pricing-btn"
                      }
                      href={plan.cta.href ?? "#"}
                      onClick={() => handlePricingCtaClick(plan.cta.analytics)}
                    >
                      {plan.cta.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-managed">
            <div className="pricing-managed-inner">
              <div className="pricing-managed-content">
                <div className="pricing-managed-icon">
                  <MarketingIcon name="bolt" style={{ fontSize: "24px" }} />
                </div>
                <div className="pricing-managed-text">
                  <div className="pricing-managed-title">
                    Get Started Fast — Use our API keys
                  </div>
                  <div className="pricing-managed-description">
                    Skip provider signup. Use Supagen's managed API keys with a
                    5% markup on model inference costs. Available on any tier.
                  </div>
                </div>
              </div>
              <a
                className="btn-secondary-outline pricing-managed-btn"
                href={signUpHref}
                onClick={() =>
                  handleAuthCtaClick(
                    "pricing_managed_keys",
                    "start_building",
                    "signup",
                  )
                }
              >
                Start Building{" "}
                <MarketingIcon
                  name="arrow_forward"
                  style={{ fontSize: "16px" }}
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer
        theme={theme}
        onCycleTheme={cycleTheme}
        onNavLinkClick={handleNavLinkClick}
      />
    </div>
  );
}
