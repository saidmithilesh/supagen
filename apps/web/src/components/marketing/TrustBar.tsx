const providers = [
  {
    name: "OpenAI",
    logo: "https://cdn.worldvectorlogo.com/logos/openai-2.svg",
  },
  {
    name: "Anthropic",
    logo: "https://cdn.simpleicons.org/anthropic",
  },
  {
    name: "Google",
    logo: "https://ai.google.dev/static/site-assets/images/share.png",
    large: true,
  },
  {
    name: "ElevenLabs",
    logo: "https://cdn.simpleicons.org/elevenlabs",
  },
  {
    name: "fal.ai",
    logo: "https://raw.githubusercontent.com/fal-ai/fal-assets/main/Logo%20Square.svg",
  },
];

export function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="trust-bar-inner">
        <div className="trust-bar-label">Works with every major provider</div>
        <div className="trust-logos">
          {providers.map((provider) => (
            <div key={provider.name} className="trust-logo-item">
              <img
                src={provider.logo}
                alt={provider.name}
                className={
                  provider.large
                    ? "trust-logo-img trust-logo-img--large"
                    : "trust-logo-img"
                }
              />
              <span className="trust-logo-name">{provider.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
