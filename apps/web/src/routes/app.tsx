import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";
import { MaterialIcon } from "@supagen/ui/components/material-icon";

import { requireAuth } from "../auth/require-auth";
import { useWorkspaceProfile } from "../components/workspace/use-workspace-profile";
import { resolveWorkspaceIdForApp } from "../components/workspace/workspace-navigation";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => await requireAuth(),
  component: AppWorkspaceRoute,
  head: () => ({
    meta: [
      { title: "Workspace | Supagen" },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
});

function AppWorkspaceRoute() {
  const navigate = Route.useNavigate();

  return (
    <AppWorkspacePage
      onNavigateToWorkspace={(workspaceId) => {
        void navigate({
          to: "/app/workspaces/$workspaceId/overview",
          params: { workspaceId },
          replace: true,
        });
      }}
    />
  );
}

export function AppWorkspacePage({
  onNavigateToWorkspace = (workspaceId) => {
    window.location.assign(
      `/app/workspaces/${encodeURIComponent(workspaceId)}/overview`,
    );
  },
}: {
  onNavigateToWorkspace?: (workspaceId: string) => void;
}) {
  const { isLoaded } = useUser();
  const profileQuery = useWorkspaceProfile();
  const hasNavigatedRef = useRef(false);
  const hasAccessibleWorkspace =
    profileQuery.data?.memberships.some(
      (membership) => membership.workspaces.length > 0,
    ) ?? false;

  useEffect(() => {
    if (hasNavigatedRef.current || !profileQuery.data) {
      return;
    }

    const workspaceId = resolveWorkspaceIdForApp(
      profileQuery.data,
      window.localStorage,
    );

    if (!workspaceId) {
      return;
    }

    hasNavigatedRef.current = true;
    onNavigateToWorkspace(workspaceId);
  }, [onNavigateToWorkspace, profileQuery.data]);

  if (
    !isLoaded ||
    profileQuery.isLoading ||
    (profileQuery.data && hasAccessibleWorkspace)
  ) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <MaterialIcon
          aria-label="Loading workspace"
          className="animate-spin"
          name="progress_activity"
        />
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Workspace setup unavailable</CardTitle>
            <CardDescription>
              Supagen could not load your workspace profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No workspace access</CardTitle>
          <CardDescription>
            You do not have access to a Supagen workspace yet.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
