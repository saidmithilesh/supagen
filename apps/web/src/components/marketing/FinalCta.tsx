import { MarketingIcon } from "./MarketingIcon";
type FinalCtaProps = {
  onAuthCtaClick?: (
    section: string,
    ctaText: string,
    destination: string,
  ) => void;
};

export function FinalCta({ onAuthCtaClick }: FinalCtaProps) {
  return (
    <section className="final-cta">
      <div className="final-cta-watermark">
        <svg width="380" height="380" fill="none" viewBox="0 0 48 48">
          <path
            d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="final-cta-inner">
        <h2>Stop hardcoding your AI backend</h2>
        <p>
          Join developers building smarter with Supagen. Free to start, scales
          with you.
        </p>
        <a
          className="btn-primary final-cta-btn"
          href="/auth?mode=sign-up&redirect_url=/app"
          style={{ fontSize: "1.125rem", height: "52px", padding: "0 2rem" }}
          onClick={() =>
            onAuthCtaClick?.("final_cta", "start_building_free", "signup")
          }
        >
          <MarketingIcon name="rocket_launch" style={{ fontSize: "22px" }} />
          Start Building -- Free
        </a>
      </div>
    </section>
  );
}
