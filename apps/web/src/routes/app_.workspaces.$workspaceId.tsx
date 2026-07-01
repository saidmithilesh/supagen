import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../auth/require-auth";
import { WorkspaceOverviewRootRoute } from "../components/workspace/WorkspaceShell";

export const Route = createFileRoute("/app_/workspaces/$workspaceId")({
  beforeLoad: async () => await requireAuth(),
  component: WorkspaceOverviewRootRoute,
  head: () => ({
    meta: [
      { title: "Workspace overview | Supagen" },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
});
