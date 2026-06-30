import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../auth/require-auth";
import { WorkspaceOverviewRoute } from "../components/workspace/WorkspaceShell";

export const Route = createFileRoute("/app_/workspaces/$workspaceId_/overview")(
  {
    beforeLoad: async () => await requireAuth(),
    component: WorkspaceOverviewRoute,
    head: () => ({
      meta: [
        { title: "Workspace overview | Supagen" },
        {
          name: "robots",
          content: "noindex",
        },
      ],
    }),
  },
);
