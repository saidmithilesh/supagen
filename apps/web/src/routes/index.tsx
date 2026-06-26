import { createFileRoute } from "@tanstack/react-router";

import { Homepage } from "../components/marketing/Homepage";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Supagen | The backend for your AI features & Agents" },
      {
        name: "description",
        content:
          "Supagen is the AI backend layer for prompts, model routing, observability, and cost tracking across every AI modality.",
      },
    ],
  }),
});

export function LandingPage() {
  return <Homepage />;
}
