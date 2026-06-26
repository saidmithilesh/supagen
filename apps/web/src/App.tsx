import type { HealthCheckResponse } from "@supagen/shared";

const sampleHealth: HealthCheckResponse = {
  status: "ok",
  service: "supagen-api",
};

export function App() {
  return (
    <main className="app-shell">
      <section className="workspace-panel">
        <div>
          <p className="eyebrow">Supagen</p>
          <h1>AI gateway workspace</h1>
        </div>

        <dl className="status-grid" aria-label="Workspace status">
          <div>
            <dt>Backend</dt>
            <dd>apps/api</dd>
          </div>
          <div>
            <dt>Frontend</dt>
            <dd>apps/web</dd>
          </div>
          <div>
            <dt>Shared types</dt>
            <dd>{sampleHealth.service}</dd>
          </div>
          <div>
            <dt>Health</dt>
            <dd>{sampleHealth.status}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
