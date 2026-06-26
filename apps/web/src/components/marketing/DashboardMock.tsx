import type React from "react";
import { useRef, useState, useEffect } from "react";

import { MarketingIcon, type MarketingIconName } from "./MarketingIcon";
export function DashboardMock() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const compute = () => {
      if (!wrapperRef.current || !mockRef.current) return;
      const wrapperWidth = wrapperRef.current.offsetWidth;
      const mockNaturalWidth = mockRef.current.offsetWidth;
      const mockNaturalHeight = mockRef.current.offsetHeight;
      const newScale = Math.min(1, wrapperWidth / mockNaturalWidth);
      setScale(newScale);
      if (newScale < 1) {
        setWrapperHeight(mockNaturalHeight * newScale);
      } else {
        setWrapperHeight(undefined);
      }
    };

    // Run once at natural size, then apply scale
    const frame = requestAnimationFrame(compute);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const isScaled = scale < 1;

  return (
    <div
      ref={wrapperRef}
      className="dashboard-mock-wrapper"
      style={{
        textAlign: "left",
        ...(isScaled && { height: wrapperHeight, overflow: "hidden" }),
      }}
    >
      <div
        ref={mockRef}
        className="dashboard-mock"
        style={
          isScaled
            ? { transform: `scale(${scale})`, transformOrigin: "top left" }
            : undefined
        }
      >
        <div className="mock-topbar">
          <div className="mock-dots">
            <span className="mock-dot mock-dot--red" />
            <span className="mock-dot mock-dot--yellow" />
            <span className="mock-dot mock-dot--green" />
          </div>
        </div>
        <div className="mock-body">
          <div className="mock-sidebar">
            <div className="mock-sidebar-brand">
              <div className="mock-sidebar-brand-icon">
                <svg width="14" height="14" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="mock-nav-label">Supagen</span>
            </div>
            <div className="mock-nav-item active">
              <MarketingIcon name="dashboard" />
              <span className="mock-nav-label">Dashboard</span>
            </div>
            <div className="mock-nav-item">
              <MarketingIcon name="smart_toy" />
              <span className="mock-nav-label">Templates</span>
            </div>
            <div className="mock-nav-item">
              <MarketingIcon name="content_copy" />
              <span className="mock-nav-label">Invocations</span>
            </div>
            <div className="mock-nav-item">
              <MarketingIcon name="settings" />
              <span className="mock-nav-label">Settings</span>
            </div>
          </div>
          <div className="mock-content">
            {/* Header */}
            <div className="mock-content-header">
              <div className="mock-content-title">Dashboard</div>
              <div className="mock-mini-btn">
                <MarketingIcon name="add" style={{ fontSize: "14px" }} /> New
                Template
              </div>
            </div>

            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                marginBottom: "0.875rem",
              }}
            >
              <StatCard
                label="Total Invocations"
                icon="bolt"
                value="142.5k"
                changeValue="+12.5%"
                changeLabel="vs last month"
                changeType="success"
              />
              <StatCard
                label="Active Agents"
                icon="smart_toy"
                value="8"
                changeValue="0%"
                changeLabel="stable"
                changeType="neutral"
              />
              <StatCard
                label="Est. Cost (MTD)"
                icon="attach_money"
                value="$240.50"
                changeValue="+5.2%"
                changeLabel="vs last month"
                changeType="error"
              />
            </div>

            {/* Filter / Sort Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.875rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <FilterChip label="Type: All" />
                <FilterChip label="Model: All" />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "var(--text-label-md)",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Sort by:
                <span
                  style={{
                    color: "var(--color-foreground)",
                    fontWeight: 500,
                  }}
                >
                  Newest
                </span>
                <MarketingIcon
                  name="expand_more"
                  style={{
                    fontSize: "14px",
                    color: "var(--color-foreground-muted)",
                  }}
                />
              </div>
            </div>

            {/* Agent Cards */}
            <div
              className="mock-agent-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
              }}
            >
              <AgentCard
                name="Customer Support Bot"
                icon="support_agent"
                iconBg="var(--color-success-light)"
                iconColor="var(--color-success)"
                status="Production"
                statusType="production"
                model="GPT-5.4"
                modelIconColor="var(--color-primary)"
                totalCalls="14,203"
                avgLatency="1.2s"
                avgCost="$0.03/run"
                footerLeft="Last run: 2m ago"
                footerLeftIcon="schedule"
              />
              <AgentCard
                name="Ad Generator"
                icon="movie"
                iconBg="color-mix(in srgb, var(--color-primary-light) 12%, transparent)"
                iconColor="var(--color-primary-light)"
                status="Production"
                statusType="production"
                model="Kling 3.0"
                modelIconColor="var(--color-primary-light)"
                modelIconType="sparkle"
                totalCalls="420"
                avgLatency="8.4s"
                avgCost="$0.72/run"
                footerLeft="Last run: 34m ago"
                footerLeftIcon="schedule"
              />
              <AgentCard
                name="Voice Over"
                icon="record_voice_over"
                iconBg="var(--color-warning-light)"
                iconColor="var(--color-warning)"
                status="Production"
                statusType="production"
                model="ElevenLabs v3"
                modelIconColor="var(--color-warning)"
                modelIconType="sparkle"
                totalCalls="3,840"
                avgLatency="2.1s"
                avgCost="$0.08/run"
                footerLeft="Last run: 8m ago"
                footerLeftIcon="schedule"
              />
              <AgentCard
                name="Avatar Generator"
                icon="face"
                iconBg="var(--color-info-light)"
                iconColor="var(--color-info)"
                status="Paused"
                statusType="paused"
                model="Nano Banana"
                modelIconColor="var(--color-error)"
                modelIconType="sparkle"
                totalCalls="156"
                avgLatency="3.2s"
                avgCost="$0.06/run"
                footerLeft="Last run: 3h ago"
                footerLeftIcon="schedule"
              />
              <AgentCard
                className="mock-card-desktop-only"
                name="Contract Analyzer"
                icon="gavel"
                iconBg="var(--color-warning-light)"
                iconColor="var(--color-warning)"
                status="Production"
                statusType="production"
                model="Claude Opus 4.6"
                modelIconColor="var(--color-primary-light)"
                modelIconType="sparkle"
                totalCalls="891"
                avgLatency="2.8s"
                avgCost="$0.12/run"
                footerLeft="Last run: 22m ago"
                footerLeftIcon="schedule"
              />
              <AgentCard
                className="mock-card-desktop-only"
                name="Announcement Gen"
                icon="campaign"
                iconBg="var(--color-success-light)"
                iconColor="var(--color-success)"
                status="Production"
                statusType="production"
                model="Gemini 3.1 Pro"
                modelIconColor="var(--color-info)"
                modelIconType="sparkle"
                totalCalls="6,102"
                avgLatency="0.9s"
                avgCost="$0.02/run"
                footerLeft="Last run: 5m ago"
                footerLeftIcon="schedule"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.25rem 0.625rem",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-label-md)",
        fontWeight: 500,
        color: "var(--color-foreground)",
        background: "var(--color-surface)",
        cursor: "default",
      }}
    >
      {label}
      <MarketingIcon
        name="expand_more"
        style={{ fontSize: "14px", color: "var(--color-foreground-muted)" }}
      />
    </div>
  );
}

function StatCard({
  label,
  icon,
  value,
  changeValue,
  changeLabel,
  changeType,
}: {
  label: string;
  icon: MarketingIconName;
  value: string;
  changeValue: string;
  changeLabel: string;
  changeType: "success" | "error" | "neutral";
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "1rem",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-body-md)",
            fontWeight: 500,
            color: "var(--color-foreground-muted)",
          }}
        >
          {label}
        </span>
        <MarketingIcon
          name={icon}
          style={{
            fontSize: "18px",
            color: "var(--color-primary)",
            opacity: 0.7,
          }}
        />
      </div>
      <div
        style={{
          fontSize: "var(--text-display-sm)",
          fontWeight: 700,
          color: "var(--color-foreground)",
          marginTop: "0.25rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          marginTop: "0.375rem",
        }}
      >
        <span
          className={`mock-change mock-change--${changeType}`}
          style={{
            fontSize: "var(--text-label-md)",
            fontWeight: 700,
            padding: "0.125rem 0.375rem",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {changeValue}
        </span>
        <span
          style={{
            fontSize: "var(--text-label-md)",
            color: "var(--color-foreground-muted)",
          }}
        >
          {changeLabel}
        </span>
      </div>
    </div>
  );
}

type StatusType = "production" | "testing" | "paused" | "error";

function AgentCard({
  name,
  icon,
  iconBg,
  iconColor,
  status,
  statusType,
  model,
  modelIconColor,
  modelIconType = "psychology",
  totalCalls,
  avgLatency,
  avgLatencyMuted,
  avgCost,
  avgCostMuted,
  footerLeft,
  footerLeftIcon,
  footerLeftError,
  className,
}: {
  name: string;
  icon: MarketingIconName;
  iconBg: string;
  iconColor: string;
  status: string;
  statusType: StatusType;
  model: string;
  modelIconColor: string;
  modelIconType?: "psychology" | "sparkle";
  totalCalls: string;
  avgLatency: string;
  avgLatencyMuted?: boolean;
  avgCost: string;
  avgCostMuted?: boolean;
  footerLeft: string;
  footerLeftIcon: MarketingIconName;
  footerLeftError?: boolean;
  className?: string;
}) {
  const showDot =
    statusType === "production" ||
    statusType === "testing" ||
    statusType === "error";
  const metaColor = "var(--color-foreground)";
  const mutedColor = "var(--color-foreground-muted)";

  return (
    <div
      className={className}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "1rem",
        boxShadow: "var(--shadow-soft)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-lg)",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MarketingIcon
              name={icon}
              style={{ fontSize: "20px", color: iconColor }}
            />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "var(--text-body-md)",
                color: "var(--color-foreground)",
                lineHeight: 1.3,
              }}
            >
              {name}
            </div>
            <span
              className={`mock-status mock-status--${statusType}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "var(--text-label-md)",
                fontWeight: 500,
                padding: "0.1rem 0.5rem",
                borderRadius: "var(--radius-full)",
                marginTop: "0.2rem",
              }}
            >
              {showDot && (
                <span
                  className={`mock-status-dot mock-status-dot--${statusType}`}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    animation: "pulse-dot 2s infinite",
                    flexShrink: 0,
                  }}
                />
              )}
              {status}
            </span>
          </div>
        </div>
        <MarketingIcon
          name="more_vert"
          style={{
            fontSize: "18px",
            color: "var(--color-foreground-muted)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Metadata grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem 0.625rem",
          marginBottom: "0.75rem",
        }}
      >
        <MetaCell label="Model">
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <MarketingIcon
              name={modelIconType === "sparkle" ? "auto_awesome" : "psychology"}
              style={{ fontSize: "13px", color: modelIconColor }}
            />
            <span
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: 500,
                color: metaColor,
              }}
            >
              {model}
            </span>
          </div>
        </MetaCell>
        <MetaCell label="Total Calls">
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: metaColor,
            }}
          >
            {totalCalls}
          </span>
        </MetaCell>
        <MetaCell label="Avg Latency">
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: avgLatencyMuted ? mutedColor : metaColor,
            }}
          >
            {avgLatency}
          </span>
        </MetaCell>
        <MetaCell label="Avg Cost">
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: avgCostMuted ? mutedColor : metaColor,
            }}
          >
            {avgCost}
          </span>
        </MetaCell>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "0.625rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "var(--text-label-md)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: footerLeftError
              ? "var(--color-error)"
              : "var(--color-foreground-muted)",
          }}
        >
          <MarketingIcon name={footerLeftIcon} style={{ fontSize: "13px" }} />
          {footerLeft}
        </span>
        <span
          style={{
            fontWeight: 500,
            color: "var(--color-foreground-muted)",
          }}
        >
          View Logs →
        </span>
      </div>
    </div>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
      <span
        style={{
          fontSize: "var(--text-label-md)",
          color: "var(--color-foreground-muted)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
