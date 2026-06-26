import { useState } from "react";

import { MarketingIcon } from "./MarketingIcon";
export function AgentTerminal() {
  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "other">(
    "claude",
  );

  return (
    <section
      id="how-it-works"
      className="section agent-terminal-section"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div className="section-inner" style={{ textAlign: "center" }}>
        <div className="section-label">
          <MarketingIcon name="cable" style={{ fontSize: "18px" }} />
          Connect Your Agent
        </div>
        <div className="section-heading">Go to production in minutes</div>
        <div className="section-subheading" style={{ margin: "0 auto" }}>
          One connection. Every AI capability Supagen offers. No SDK, no
          boilerplate, no config files to maintain.
        </div>

        <div className="agent-terminal">
          <div className="agent-terminal-tabs">
            <button
              className={
                activeTab === "claude"
                  ? "agent-terminal-tab active"
                  : "agent-terminal-tab"
              }
              onClick={() => setActiveTab("claude")}
            >
              <MarketingIcon name="terminal" style={{ fontSize: "16px" }} />
              Claude Code
            </button>
            <button
              className={
                activeTab === "cursor"
                  ? "agent-terminal-tab active"
                  : "agent-terminal-tab"
              }
              onClick={() => setActiveTab("cursor")}
            >
              <MarketingIcon name="code" style={{ fontSize: "16px" }} />
              Cursor
            </button>
            <button
              className={
                activeTab === "other"
                  ? "agent-terminal-tab active"
                  : "agent-terminal-tab"
              }
              onClick={() => setActiveTab("other")}
            >
              <MarketingIcon name="extension" style={{ fontSize: "16px" }} />
              Other Agents
            </button>
          </div>

          <div
            className={
              activeTab === "claude"
                ? "agent-terminal-panel active"
                : "agent-terminal-panel"
            }
          >
            <div className="agent-terminal-body">
              <pre className="agent-terminal-code">
                <span className="code-prompt">$</span> claude mcp add supagen
                --transport http{" "}
                <span className="code-string">
                  &quot;https://mcp.supagen.dev&quot;
                </span>
              </pre>
            </div>
          </div>

          <div
            className={
              activeTab === "cursor"
                ? "agent-terminal-panel active"
                : "agent-terminal-panel"
            }
          >
            <div className="agent-terminal-body">
              <pre className="agent-terminal-code">
                <span className="code-comment">{"// .mcp.json"}</span>
                {"\n"}
                {"{\n"}
                {"  "}
                <span className="code-key">&quot;mcpServers&quot;</span>
                {": {\n"}
                {"    "}
                <span className="code-key">&quot;supagen&quot;</span>
                {": {\n"}
                {"      "}
                <span className="code-key">&quot;type&quot;</span>
                {": "}
                <span className="code-string">&quot;url&quot;</span>
                {",\n"}
                {"      "}
                <span className="code-key">&quot;url&quot;</span>
                {": "}
                <span className="code-string">
                  &quot;https://mcp.supagen.dev&quot;
                </span>
                {"\n"}
                {"    }\n"}
                {"  }\n"}
                {"}"}
              </pre>
            </div>
          </div>

          <div
            className={
              activeTab === "other"
                ? "agent-terminal-panel active"
                : "agent-terminal-panel"
            }
          >
            <div className="agent-terminal-body">
              <pre className="agent-terminal-code">
                <span className="code-key">Server URL</span>
                {"    "}
                <span className="code-string">https://mcp.supagen.dev</span>
                {"\n"}
                <span className="code-key">Transport</span>
                {"     "}
                <span className="code-string">Streamable HTTP</span>
                {"\n"}
                <span className="code-key">Auth</span>
                {"          "}
                <span className="code-string">
                  OAuth (auto-prompted on first connect)
                </span>
              </pre>
            </div>
          </div>
        </div>

        <div className="agent-talking-piece">
          <div className="agent-talking-label">Then just tell your agent</div>
          <div className="agent-talking-message">
            <span className="agent-talking-text">
              Build me a support email triage endpoint with Supagen
            </span>
            <MarketingIcon
              name="send"
              className="agent-talking-send"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
