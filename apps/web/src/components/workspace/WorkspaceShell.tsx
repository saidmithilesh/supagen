import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@supagen/ui/components/sidebar";

import {
  findWorkspaceInProfile,
  persistLastVisitedWorkspaceId,
} from "./workspace-navigation";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { useWorkspaceProfile } from "./use-workspace-profile";

const SIDEBAR_STATE_STORAGE_KEY = "workspace-sidebar-state";

type WorkspaceOverviewPageProps = {
  onNavigateToWorkspace?: (workspaceId: string) => void;
  onWorkspaceUnavailable?: () => void;
  workspaceId: string;
};

export function WorkspaceOverviewPage({
  onNavigateToWorkspace,
  onWorkspaceUnavailable = () => {
    window.location.assign("/app");
  },
  workspaceId,
}: WorkspaceOverviewPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(readInitialSidebarState);
  const workspaceProfile = useWorkspaceProfile();

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STATE_STORAGE_KEY,
      isSidebarOpen ? "expanded" : "collapsed",
    );
  }, [isSidebarOpen]);

  useEffect(() => {
    const profile = workspaceProfile.data;

    if (!profile) {
      return;
    }

    if (findWorkspaceInProfile(profile, workspaceId)) {
      persistLastVisitedWorkspaceId(window.localStorage, workspaceId);
      return;
    }

    onWorkspaceUnavailable();
  }, [onWorkspaceUnavailable, workspaceId, workspaceProfile.data]);

  return (
    <SidebarProvider
      className="bg-main-content text-foreground"
      onOpenChange={setIsSidebarOpen}
      open={isSidebarOpen}
    >
      <WorkspaceSidebar
        onNavigateToWorkspace={onNavigateToWorkspace}
        profile={workspaceProfile.data}
        workspaceId={workspaceId}
      />
      <SidebarInset
        aria-label="Workspace overview"
        className="min-h-svh bg-main-content"
      />
    </SidebarProvider>
  );
}

function readInitialSidebarState() {
  if (typeof window === "undefined") {
    return true;
  }

  const storedState = window.localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);

  return storedState !== "collapsed" && storedState !== "true";
}

export function WorkspaceOverviewRootRoute() {
  const { workspaceId } = useParams({ from: "/app_/workspaces/$workspaceId" });
  const navigate = useNavigate({ from: "/app/workspaces/$workspaceId" });

  return (
    <WorkspaceOverviewPage
      onNavigateToWorkspace={(workspaceId) => {
        void navigate({
          to: "/app/workspaces/$workspaceId/overview",
          params: { workspaceId },
        });
      }}
      onWorkspaceUnavailable={() => {
        void navigate({ to: "/app", replace: true });
      }}
      workspaceId={workspaceId}
    />
  );
}

export function WorkspaceOverviewRoute() {
  const { workspaceId } = useParams({
    from: "/app_/workspaces/$workspaceId_/overview",
  });
  const navigate = useNavigate({
    from: "/app/workspaces/$workspaceId/overview",
  });

  return (
    <WorkspaceOverviewPage
      onNavigateToWorkspace={(workspaceId) => {
        void navigate({
          to: "/app/workspaces/$workspaceId/overview",
          params: { workspaceId },
        });
      }}
      onWorkspaceUnavailable={() => {
        void navigate({ to: "/app", replace: true });
      }}
      workspaceId={workspaceId}
    />
  );
}
