import { createFileRoute } from "@tanstack/react-router";

import { PricingPage } from "../components/marketing/PricingPage";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing | Supagen" },
      {
        name: "description",
        content:
          "Simple request-volume pricing for Supagen's AI backend platform.",
      },
    ],
  }),
});
