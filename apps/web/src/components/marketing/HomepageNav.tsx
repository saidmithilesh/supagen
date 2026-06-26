type HomepageNavProps = {
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

export function HomepageNav({
  onAuthCtaClick,
  onNavLinkClick,
}: HomepageNavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="nav-brand" href="/">
          <div className="nav-brand-mark">
            <svg width="18" height="18" fill="none" viewBox="0 0 48 48">
              <path
                d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                fill="currentColor"
              />
            </svg>
          </div>
          Supagen
        </a>
        <div className="nav-links">
          <a
            className="nav-link"
            href="#how-it-works"
            onClick={() => onNavLinkClick?.("nav", "connect", "#how-it-works")}
          >
            Connect
          </a>
          <a
            className="nav-link"
            href="/pricing"
            onClick={() => onNavLinkClick?.("nav", "pricing", "/pricing")}
          >
            Pricing
          </a>
          <a
            className="nav-link"
            href="/models"
            onClick={() => onNavLinkClick?.("nav", "models", "/models")}
          >
            Models
          </a>
          <a
            className="nav-link"
            href="/auth?mode=sign-in&redirect_url=/app"
            onClick={() => onAuthCtaClick?.("nav", "log_in", "login")}
          >
            Log In
          </a>
          <a
            className="nav-cta"
            href="/auth?mode=sign-up&redirect_url=/app"
            onClick={() => onAuthCtaClick?.("nav", "start_building", "signup")}
          >
            Start Building
          </a>
        </div>
      </div>
    </nav>
  );
}
