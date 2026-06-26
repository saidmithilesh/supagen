import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPage } from "../components/marketing/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Supagen" },
      {
        name: "description",
        content: "Supagen Privacy Policy.",
      },
    ],
  }),
});
