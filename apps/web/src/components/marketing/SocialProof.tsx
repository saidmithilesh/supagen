import { MarketingIcon } from "./MarketingIcon";
const testimonials = [
  {
    quote:
      "My AI video maker has 26 LLM calls across text, image, video, and audio. The prompts need constant tuning, but Supagen turned painful redeploys into quick dashboard edits. All that complexity finally feels effortless.",
    name: "Rahul Singh",
    role: "Flowshorts",
    logo: "/logo-flowshorts.png",
    url: "https://flowshorts.ai/",
  },
  {
    quote:
      "I was stuck trying to wire up my AI chat app until I connected Supagen via MCP. Suddenly I could swap between models to find what worked best, see every tool call logged, and actually understand where my costs were going. It just clicked.",
    name: "Mith Said",
    role: "Saarthi App",
    logo: "/logo-saarthi.png",
    url: "https://play.google.com/store/apps/details?id=com.mithsupalabs.saarthi",
  },
  {
    quote:
      "Our meal planning app has complex AI integrations that need to improve over time. With Supagen, we had versioned prompts, observability, and model routing working from day one -- no extra infrastructure required.",
    name: "Durgesh Nandan",
    role: "Mealtime",
    logo: "/logo-mealtime.png",
    url: "https://mealtime.pro/",
  },
];

export function SocialProof() {
  return (
    <section className="section">
      <div className="section-inner" style={{ textAlign: "center" }}>
        <div className="section-label">
          <MarketingIcon name="groups" style={{ fontSize: "18px" }} />
          What Builders Say
        </div>
        <div className="section-heading">Loved by developers shipping AI</div>
        <div className="testimonials">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial">
              <div className="testimonial-text">&ldquo;{t.quote}&rdquo;</div>
              <div className="testimonial-author">
                <img className="testimonial-avatar" src={t.logo} alt={t.role} />
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <a
                    className="testimonial-role"
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.role}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
