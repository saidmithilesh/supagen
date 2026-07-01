import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../auth/require-auth";
import { WorkspacesListPage } from "../components/workspace/WorkspacesListPage";

export const Route = createFileRoute("/workspaces")({
  beforeLoad: async () => await requireAuth(),
  component: WorkspacesListPage,
  head: () => ({
    meta: [
      { title: "Workspaces | Supagen" },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
});
