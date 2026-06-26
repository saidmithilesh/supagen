import type { SupagenTheme } from "../../theme/supagen-theme";
import { MarketingIcon } from "./MarketingIcon";

type FooterProps = {
  theme: SupagenTheme;
  onCycleTheme: () => void;
  onNavLinkClick?: (
    section: string,
    linkText: string,
    destination: string,
  ) => void;
};

export function Footer({ theme, onCycleTheme, onNavLinkClick }: FooterProps) {
  const iconName = theme === "light" ? "dark_mode" : "light_mode";

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-text">
          &copy; 2026 Supagen. All rights reserved.
        </div>
        <div className="footer-links">
          <a
            className="footer-link"
            href="/pricing"
            onClick={() => onNavLinkClick?.("footer", "pricing", "/pricing")}
          >
            Pricing
          </a>
          <a
            href="/privacy"
            className="footer-link"
            onClick={() => onNavLinkClick?.("footer", "privacy", "/privacy")}
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="footer-link"
            onClick={() => onNavLinkClick?.("footer", "terms", "/terms")}
          >
            Terms
          </a>
          <button
            onClick={onCycleTheme}
            className="footer-theme-toggle"
            aria-label={`Switch theme. Current theme is ${theme}.`}
          >
            <MarketingIcon name={iconName} style={{ fontSize: "18px" }} />
          </button>
        </div>
      </div>
    </footer>
  );
}
