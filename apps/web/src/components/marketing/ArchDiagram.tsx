import { useEffect, useRef } from "react";

import { MarketingIcon, type MarketingIconName } from "./MarketingIcon";
const capabilities = [
  { icon: "description", label: "Prompt Management" },
  { icon: "tune", label: "Model Configuration" },
  { icon: "monitoring", label: "Invocation Logs" },
  { icon: "payments", label: "Cost Visibility" },
] satisfies { icon: MarketingIconName; label: string }[];

const modalities: {
  icon: MarketingIconName;
  label: string;
  accent: string;
}[] = [
  { icon: "chat", label: "Text Generation", accent: "blue" },
  { icon: "image", label: "Image Generation", accent: "purple" },
  { icon: "videocam", label: "Video Generation", accent: "pink" },
  { icon: "graphic_eq", label: "Audio & Speech", accent: "amber" },
  { icon: "data_object", label: "JSON", accent: "green" },
];

const curves = [
  {
    id: "curve1",
    d: "M 0,160 C 40,160 60,28 100,28",
    fwdDur: "2.5s",
    fwdBegin: "0s",
    revDur: "2.8s",
    revBegin: "1.4s",
  },
  {
    id: "curve2",
    d: "M 0,160 C 40,160 60,94 100,94",
    fwdDur: "2.2s",
    fwdBegin: "0.4s",
    revDur: "2.6s",
    revBegin: "1.8s",
  },
  {
    id: "curve3",
    d: "M 0,160 C 40,160 60,160 100,160",
    fwdDur: "2.0s",
    fwdBegin: "0.8s",
    revDur: "2.4s",
    revBegin: "0.6s",
  },
  {
    id: "curve4",
    d: "M 0,160 C 40,160 60,226 100,226",
    fwdDur: "2.3s",
    fwdBegin: "1.1s",
    revDur: "2.7s",
    revBegin: "0.3s",
  },
  {
    id: "curve5",
    d: "M 0,160 C 40,160 60,292 100,292",
    fwdDur: "2.6s",
    fwdBegin: "0.6s",
    revDur: "3.0s",
    revBegin: "1.0s",
  },
];

export function ArchDiagram() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supagenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const supagen = supagenRef.current;
    if (!wrapper || !supagen) return;
    // Only auto-scroll on mobile (when content overflows)
    if (wrapper.scrollWidth <= wrapper.clientWidth) return;
    // Center the Supagen stack in the viewport
    const offset =
      supagen.offsetLeft - wrapper.clientWidth / 2 + supagen.offsetWidth / 2;
    wrapper.scrollLeft = Math.max(0, offset);
  }, []);

  return (
    <div className="arch-wrapper" ref={wrapperRef}>
      <div className="arch-diagram">
        {/* LEFT: Your Application */}
        <div className="arch-app">
          <div className="arch-app-icon">
            <MarketingIcon name="code" />
          </div>
          <div className="arch-app-label">Your Application</div>
        </div>

        {/* CONNECTOR: App -> Supagen (bidirectional dots) */}
        <div className="arch-connector">
          <div className="arch-connector-track">
            <div className="arch-dot arch-dot--fwd" />
            <div
              className="arch-dot arch-dot--rev"
              style={{ animationDelay: "1.2s" }}
            />
          </div>
        </div>

        {/* RIGHT HALF: Supagen + SVG curves + Modalities */}
        <div className="arch-right-half">
          {/* CENTER: Supagen */}
          <div className="arch-supagen" ref={supagenRef}>
            <div className="arch-supagen-header">
              <div className="arch-supagen-logo">
                <svg width="26" height="26" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="arch-supagen-name">Supagen</div>
            </div>
            <div className="arch-supagen-grid">
              {capabilities.map((c) => (
                <div key={c.label} className="arch-capability">
                  <MarketingIcon name={c.icon} />
                  {c.label}
                </div>
              ))}
            </div>
            <div className="arch-more">+ more</div>
          </div>

          {/* SVG curved branching connectors */}
          <div className="arch-modalities-container">
            <svg
              className="arch-svg-paths"
              viewBox="0 0 340 320"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              {curves.map((curve) => (
                <g key={curve.id}>
                  <path
                    id={curve.id}
                    d={curve.d}
                    stroke="var(--color-border)"
                    fill="none"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                  <circle r="4" fill="var(--color-primary)" opacity="0.9">
                    <animateMotion
                      dur={curve.fwdDur}
                      repeatCount="indefinite"
                      begin={curve.fwdBegin}
                    >
                      <mpath href={`#${curve.id}`} />
                    </animateMotion>
                  </circle>
                  <circle r="3" fill="var(--color-primary)" opacity="0.5">
                    <animateMotion
                      dur={curve.revDur}
                      repeatCount="indefinite"
                      keyPoints="1;0"
                      keyTimes="0;1"
                      begin={curve.revBegin}
                    >
                      <mpath href={`#${curve.id}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}
            </svg>

            {/* Modality Cards */}
            <div className="arch-modalities">
              {modalities.map((m) => (
                <div
                  key={m.label}
                  className="arch-modality-card"
                  data-accent={m.accent}
                >
                  <div className="arch-modality-icon">
                    <MarketingIcon name={m.icon} />
                  </div>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
