import { MarketingIcon } from "./MarketingIcon";
type PillarMockProps = {
  variant: "template-editor" | "model-config" | "invocation-detail";
};

export function PillarMock({ variant }: PillarMockProps) {
  switch (variant) {
    case "template-editor":
      return <TemplateEditorMock />;
    case "model-config":
      return <ModelConfigMock />;
    case "invocation-detail":
      return <InvocationDetailMock />;
  }
}

function TemplateEditorMock() {
  return (
    <div className="pillar-visual">
      <div className="mock-screen">
        <div className="mock-screen-header">
          <div className="mock-screen-title">Template Editor</div>
          <div className="mock-badge">
            <span
              className="mock-status-dot mock-status-dot--production"
              style={{ display: "inline-block" }}
            />
            v3 -- Production
          </div>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <div
            style={{
              fontSize: "var(--text-label-md)",
              color: "var(--color-foreground-muted)",
              marginBottom: "0.375rem",
            }}
          >
            System Prompt
          </div>
          <div className="mock-prompt-area">
            You are a customer support classifier. Analyze the incoming ticket
            and return a JSON object with: category, priority, sentiment, and
            suggested_action.
            <br />
            <br />
            Categories: billing, technical, feature_request, bug_report
            <br />
            Priority levels: p0_critical, p1_high, p2_medium, p3_low
          </div>
        </div>
        <div
          style={{
            fontSize: "var(--text-label-md)",
            color: "var(--color-foreground-muted)",
            marginBottom: "0.375rem",
          }}
        >
          Variables
        </div>
        <div className="mock-var-row">
          <span className="mock-var-name">{"{{ticket_content}}"}</span>
          <span className="mock-var-type">String</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
            }}
          >
            Required
          </span>
        </div>
        <div className="mock-var-row">
          <span className="mock-var-name">{"{{customer_tier}}"}</span>
          <span className="mock-var-type">String</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
            }}
          >
            Optional
          </span>
        </div>
        <div className="mock-var-row">
          <span className="mock-var-name">{"{{previous_tickets}}"}</span>
          <span className="mock-var-type">Array</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
            }}
          >
            Optional
          </span>
        </div>
        <div className="mock-var-row" style={{ borderBottom: "none" }}>
          <span className="mock-var-name">{"{{language}}"}</span>
          <span className="mock-var-type">String</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
            }}
          >
            Optional
          </span>
        </div>
      </div>
    </div>
  );
}

function ConfigSlider({
  label,
  value,
  fill,
  minLabel,
  maxLabel,
  last,
}: {
  label: string;
  value: string;
  fill: string;
  minLabel?: string;
  maxLabel?: string;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-label-md)",
            color: "var(--color-foreground-muted)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "var(--text-label-md)",
            fontFamily: "var(--font-mono)",
            color: "var(--color-foreground-muted)",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--color-border)",
          borderRadius: "2px",
          position: "relative",
          marginBottom: minLabel ? "0.375rem" : 0,
        }}
      >
        <div
          style={{
            width: fill,
            height: "100%",
            background: "var(--color-primary)",
            borderRadius: "2px",
          }}
        />
      </div>
      {minLabel && maxLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
              opacity: 0.6,
            }}
          >
            {minLabel}
          </span>
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-foreground-muted)",
              opacity: 0.6,
            }}
          >
            {maxLabel}
          </span>
        </div>
      )}
    </div>
  );
}

function ModelConfigMock() {
  return (
    <div className="pillar-visual">
      <div className="mock-screen">
        <div className="mock-screen-header">
          <div className="mock-screen-title">Model Configuration</div>
          <span
            style={{
              fontSize: "var(--text-label-md)",
              color: "var(--color-foreground-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            image-gen
          </span>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              fontSize: "var(--text-label-md)",
              color: "var(--color-foreground-muted)",
              marginBottom: "0.375rem",
            }}
          >
            Provider &amp; Model
          </div>
          <div
            style={{
              background: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "0.625rem 0.875rem",
              fontSize: "var(--text-body-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>fal.ai / Nano Banana 2</span>
            <MarketingIcon
              name="expand_more"
              style={{
                fontSize: "18px",
                color: "var(--color-foreground-muted)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--text-label-md)",
                color: "var(--color-foreground-muted)",
                marginBottom: "0.375rem",
              }}
            >
              Aspect Ratio
            </div>
            <div
              style={{
                background: "var(--color-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "0.5rem 0.75rem",
                fontSize: "var(--text-body-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>16:9</span>
              <MarketingIcon
                name="expand_more"
                style={{
                  fontSize: "16px",
                  color: "var(--color-foreground-muted)",
                }}
              />
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--text-label-md)",
                color: "var(--color-foreground-muted)",
                marginBottom: "0.375rem",
              }}
            >
              Output Format
            </div>
            <div
              style={{
                background: "var(--color-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "0.5rem 0.75rem",
                fontSize: "var(--text-body-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>PNG</span>
              <MarketingIcon
                name="expand_more"
                style={{
                  fontSize: "16px",
                  color: "var(--color-foreground-muted)",
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <ConfigSlider label="Number of Images" value="2" fill="33%" />
          <ConfigSlider label="Resolution" value="2k" fill="43%" />
          <ConfigSlider label="Safety Tolerance" value="3" fill="40%" last />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.625rem 0.75rem",
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MarketingIcon
              name="palette"
              style={{ fontSize: "16px", color: "var(--color-warning)" }}
            />
            <span
              style={{
                fontSize: "var(--text-label-md)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Style Preset
            </span>
          </div>
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-foreground)",
            }}
          >
            Anime
          </span>
        </div>
      </div>
    </div>
  );
}

function InvocationDetailMock() {
  return (
    <div className="pillar-visual">
      <div className="mock-screen">
        <div className="mock-screen-header">
          <div className="mock-screen-title">Invocation Detail</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span
              className="mock-status mock-status--production"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "var(--text-label-md)",
                fontWeight: 500,
                padding: "0.125rem 0.5rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              <span
                className="mock-status-dot mock-status-dot--production"
                style={{ display: "inline-block" }}
              />
              200 OK
            </span>
          </div>
        </div>
        {/* Metadata bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            padding: "0.625rem",
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--text-label-sm)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Template
            </div>
            <div
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: 600,
                color: "var(--color-foreground)",
                marginTop: "0.125rem",
              }}
            >
              Ticket Classifier
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--text-label-sm)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Model
            </div>
            <div
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: 600,
                color: "var(--color-foreground)",
                marginTop: "0.125rem",
              }}
            >
              GPT-4 Turbo
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--text-label-sm)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Latency
            </div>
            <div
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: "var(--color-foreground)",
                marginTop: "0.125rem",
              }}
            >
              1.2s
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--text-label-sm)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Cost
            </div>
            <div
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: "var(--color-foreground)",
                marginTop: "0.125rem",
              }}
            >
              $0.018
            </div>
          </div>
        </div>
        {/* Token usage */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "0.5rem 0.625rem",
              background: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <MarketingIcon
              name="arrow_upward"
              style={{ fontSize: "14px", color: "var(--color-info)" }}
            />
            <span
              style={{
                fontSize: "var(--text-label-md)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Input:
            </span>
            <span
              style={{
                fontSize: "var(--text-label-md)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              342 tokens
            </span>
          </div>
          <div
            style={{
              flex: 1,
              padding: "0.5rem 0.625rem",
              background: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <MarketingIcon
              name="arrow_downward"
              style={{ fontSize: "14px", color: "var(--color-success)" }}
            />
            <span
              style={{
                fontSize: "var(--text-label-md)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Output:
            </span>
            <span
              style={{
                fontSize: "var(--text-label-md)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              78 tokens
            </span>
          </div>
        </div>
        {/* Input */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div
            style={{
              fontSize: "var(--text-label-md)",
              fontWeight: 600,
              color: "var(--color-foreground-muted)",
              marginBottom: "0.375rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <MarketingIcon name="input" style={{ fontSize: "14px" }} />
            Input
          </div>
          <div
            style={{
              background: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-label-md)",
              color: "var(--color-foreground-muted)",
              lineHeight: 1.6,
            }}
          >
            My subscription was charged twice this month and I need a refund
            ASAP. Order #4892. This is the third time this has happened.
          </div>
        </div>
        {/* Output */}
        <div>
          <div
            style={{
              fontSize: "var(--text-label-md)",
              fontWeight: 600,
              color: "var(--color-foreground-muted)",
              marginBottom: "0.375rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <MarketingIcon name="output" style={{ fontSize: "14px" }} />
            Output
          </div>
          <div
            style={{
              background: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-label-md)",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: "var(--color-foreground-muted)" }}>
              {"{"}
            </span>
            <br />
            &nbsp;&nbsp;
            <span style={{ color: "var(--color-info-foreground)" }}>
              &quot;category&quot;
            </span>
            :{" "}
            <span style={{ color: "var(--color-success-foreground)" }}>
              &quot;billing&quot;
            </span>
            ,
            <br />
            &nbsp;&nbsp;
            <span style={{ color: "var(--color-info-foreground)" }}>
              &quot;priority&quot;
            </span>
            :{" "}
            <span style={{ color: "var(--color-success-foreground)" }}>
              &quot;p1_high&quot;
            </span>
            ,
            <br />
            &nbsp;&nbsp;
            <span style={{ color: "var(--color-info-foreground)" }}>
              &quot;sentiment&quot;
            </span>
            :{" "}
            <span style={{ color: "var(--color-success-foreground)" }}>
              &quot;frustrated&quot;
            </span>
            ,
            <br />
            &nbsp;&nbsp;
            <span style={{ color: "var(--color-info-foreground)" }}>
              &quot;suggested_action&quot;
            </span>
            :{" "}
            <span style={{ color: "var(--color-success-foreground)" }}>
              &quot;escalate_to_billing&quot;
            </span>
            <br />
            <span style={{ color: "var(--color-foreground-muted)" }}>
              {"}"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
