import { createFileRoute } from "@tanstack/react-router";

import { Homepage } from "../components/marketing/Homepage";
import { SUPAGEN_META_DESCRIPTION, SUPAGEN_META_TITLE } from "./__root";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: SUPAGEN_META_TITLE },
      {
        name: "description",
        content: SUPAGEN_META_DESCRIPTION,
      },
    ],
  }),
});

export function LandingPage() {
  return <Homepage />;
}
