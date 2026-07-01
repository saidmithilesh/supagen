import { useUser } from "@clerk/tanstack-react-start";
import type { ReactNode } from "react";

import { Badge } from "@supagen/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";
import { MaterialIcon } from "@supagen/ui/components/material-icon";
import { cn } from "@supagen/ui/lib/utils";

import type { IamProfile } from "../../api/iam-profile";
import { useWorkspaceProfile } from "./use-workspace-profile";
import { persistLastVisitedWorkspaceId } from "./workspace-navigation";

type Membership = IamProfile["memberships"][number];
type Workspace = Membership["workspaces"][number];
type Role = Membership["role"];

const AVATAR_COLOR_CLASSES = [
  "bg-primary",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
] as const;

export function WorkspacesListPage() {
  const { isLoaded } = useUser();
  const profileQuery = useWorkspaceProfile();

  if (!isLoaded || profileQuery.isLoading) {
    return (
      <WorkspacesListShell>
        <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
          <MaterialIcon
            aria-label="Loading workspaces"
            className="animate-spin text-muted-foreground"
            name="progress_activity"
          />
        </main>
      </WorkspacesListShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <WorkspacesListShell>
        <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Workspaces unavailable</CardTitle>
              <CardDescription>
                Supagen could not load your workspace profile.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </WorkspacesListShell>
    );
  }

  const memberships =
    profileQuery.data?.memberships.filter(
      (membership) => membership.workspaces.length > 0,
    ) ?? [];

  return (
    <WorkspacesListShell>
      <main className="min-h-[calc(100svh-4rem)] bg-main-content p-6 text-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl leading-tight font-semibold tracking-normal text-foreground">
              Your Workspaces
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and access your collaborative environments.
            </p>
          </header>

          {memberships.length > 0 ? (
            <div className="space-y-8">
              {memberships.map((membership) => (
                <WorkspaceOrgSection
                  key={membership.organization.id}
                  membership={membership}
                />
              ))}
            </div>
          ) : (
            <EmptyWorkspaceList />
          )}
        </div>
      </main>
    </WorkspacesListShell>
  );
}

function WorkspacesListShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex h-16 items-center border-b border-border bg-background px-6">
        <a
          aria-label="Supagen"
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          href="/app"
        >
          <img alt="" className="size-9 shrink-0" src="/logo.svg" />
          <span className="text-base font-bold tracking-normal text-foreground">
            Supagen
          </span>
        </a>
      </header>
      {children}
    </div>
  );
}

function WorkspaceOrgSection({ membership }: { membership: Membership }) {
  return (
    <section aria-labelledby={`org-${membership.organization.id}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2
          className="text-base leading-none font-semibold text-foreground"
          id={`org-${membership.organization.id}`}
        >
          {membership.organization.name}
        </h2>
        <RoleBadge role={membership.role} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {membership.workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </section>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <a
        aria-label={workspace.name}
        className="absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        href={`/app/workspaces/${encodeURIComponent(workspace.id)}/overview`}
        onClick={() => {
          persistLastVisitedWorkspaceId(window.localStorage, workspace.id);
        }}
      />

      <div className="relative z-10 mb-4">
        <WorkspaceAvatar name={workspace.name} />
      </div>

      <div className="relative z-10 mb-4 min-w-0">
        <h3 className="truncate font-semibold text-card-foreground">
          {workspace.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {workspace.description ?? "\u00A0"}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Workspace
        </span>
        <MaterialIcon
          aria-hidden="true"
          className="text-muted-foreground transition-colors group-hover:text-foreground"
          name="arrow_forward"
          size={18}
        />
      </div>
    </article>
  );
}

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
        getWorkspaceAvatarColor(name),
      )}
    >
      {getWorkspaceInitials(name)}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge
      className={cn(
        "h-5 rounded-md px-2.5 text-xs font-medium uppercase",
        role === "owner" && "bg-primary/10 text-primary",
        role === "admin" &&
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        role === "member" &&
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      )}
      variant="secondary"
    >
      {role}
    </Badge>
  );
}

function EmptyWorkspaceList() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>No workspace access</CardTitle>
        <CardDescription>
          You do not have access to a Supagen workspace yet.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function getWorkspaceInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "W"
  );
}

function getWorkspaceAvatarColor(name: string) {
  let hash = 0;

  for (const character of name) {
    hash = (hash + character.charCodeAt(0)) % AVATAR_COLOR_CLASSES.length;
  }

  return AVATAR_COLOR_CLASSES[hash];
}
