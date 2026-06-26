import { useEffect, useRef, useState } from "react";
import { PillarMock } from "./PillarMock";

import { MarketingIcon } from "./MarketingIcon";
const PILLAR_DATA = [
  {
    pain: "Prompts are hardcoded everywhere",
    heading: "Define & Version prompts",
    body: "Manage prompts and versions without redeploying. Update behavior from the dashboard, not your code.",
    variant: "template-editor" as const,
  },
  {
    pain: "Switching models means code changes",
    heading: "Route & Configure Models",
    body: "Switch providers, adjust params, set up fallbacks. All from the dashboard -- zero code changes.",
    variant: "model-config" as const,
  },
  {
    pain: "No idea what my AI features cost",
    heading: "Observe Every Response",
    body: "Every AI call logged with cost, latency, tokens, I/O. Debug production issues in seconds.",
    variant: "invocation-detail" as const,
  },
];

type PillarsProps = {
  onAuthCtaClick?: (
    section: string,
    ctaText: string,
    destination: string,
  ) => void;
};

export function Pillars({ onAuthCtaClick }: PillarsProps) {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [inView, setInView] = useState(false);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-pillar"));
            setCurrentPillar(index);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" },
    );

    triggerRefs.current.forEach((trigger) => {
      if (trigger) observer.observe(trigger);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      { threshold: 0 },
    );

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`pillars-section${inView ? " in-view" : ""}`}
    >
      <div className="pillars-scroll-container">
        <div className="pillars-sticky">
          <div className="pillars-header">
            <div className="section-label">
              <MarketingIcon name="inventory_2" style={{ fontSize: "18px" }} />
              What You Get
            </div>
            <div className="section-heading">Your AI backend handles</div>
            <div className="section-subheading">
              Everything your AI features need to run in production, managed
              from one dashboard.
            </div>
          </div>

          <div className="pillars-content">
            <div className="pillars-progress">
              {PILLAR_DATA.map((_, i) => (
                <div
                  key={i}
                  className={`pillars-progress-dot${currentPillar === i ? " active" : ""}`}
                  data-dot={i}
                />
              ))}
            </div>

            <div className="pillars-text-panel">
              {PILLAR_DATA.map((pillar, i) => (
                <div
                  key={i}
                  className={`pillar-text-item${currentPillar === i ? " active" : ""}`}
                  data-pillar={i}
                >
                  <div className="pillar-pain">
                    <MarketingIcon name="close" />
                    {pillar.pain}
                  </div>
                  <div className="pillar-heading">{pillar.heading}</div>
                  <div className="pillar-body">{pillar.body}</div>
                  <a
                    className="pillar-cta"
                    href="/auth?mode=sign-up&redirect_url=/app"
                    onClick={() =>
                      onAuthCtaClick?.("pillars", "get_started_free", "signup")
                    }
                  >
                    Get started for free{" "}
                    <MarketingIcon
                      name="arrow_forward"
                      style={{ fontSize: "16px" }}
                    />
                  </a>
                </div>
              ))}
            </div>

            <div className="pillars-visual-panel">
              {PILLAR_DATA.map((pillar, i) => (
                <div
                  key={i}
                  className={`pillar-visual-item${currentPillar === i ? " active" : ""}`}
                  data-pillar={i}
                >
                  <PillarMock variant={pillar.variant} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invisible scroll triggers */}
        {PILLAR_DATA.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              triggerRefs.current[i] = el;
            }}
            className="pillar-trigger"
            data-pillar={i}
            style={{ position: "absolute", top: `${i * 100}vh` }}
          />
        ))}
      </div>

      {/* Mobile: flat stacked layout — visual above text, all visible */}
      <div className="pillars-mobile">
        {PILLAR_DATA.map((pillar, i) => (
          <div key={i} className="pillar-mobile-item">
            <PillarMock variant={pillar.variant} />
            <div className="pillar-pain">
              <MarketingIcon name="close" />
              {pillar.pain}
            </div>
            <div className="pillar-heading">{pillar.heading}</div>
            <div className="pillar-body">{pillar.body}</div>
            <a
              className="pillar-cta"
              href="/auth?mode=sign-up&redirect_url=/app"
              onClick={() =>
                onAuthCtaClick?.("pillars", "get_started_free", "signup")
              }
            >
              Get started for free{" "}
              <MarketingIcon
                name="arrow_forward"
                style={{ fontSize: "16px" }}
              />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
