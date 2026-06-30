import { UserButton, useAuth, useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import {
  bootstrapIamProfile,
  getIamProfile,
  isIamProfileNotBootstrapped,
} from "../api/iam-profile";
import { getProfileInitials } from "../auth/profile";
import { requireAuth } from "../auth/require-auth";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@supagen/ui/components/avatar";
import { Badge } from "@supagen/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";
import { MaterialIcon } from "@supagen/ui/components/material-icon";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => await requireAuth(),
  component: AppWorkspacePage,
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

export function AppWorkspacePage() {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const profileQuery = useQuery({
    enabled: isLoaded && Boolean(user),
    queryKey: ["iam-profile", user?.id],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk session token.");
      }

      try {
        return await getIamProfile(token);
      } catch (error) {
        if (isIamProfileNotBootstrapped(error)) {
          return await bootstrapIamProfile(token);
        }

        throw error;
      }
    },
  });

  if (!isLoaded || profileQuery.isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <MaterialIcon
          className="animate-spin"
          aria-label="Loading profile"
          name="progress_activity"
        />
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="min-h-svh bg-background text-foreground">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="w-fit">
                Authenticated
              </Badge>
              <h1 className="font-heading text-3xl font-medium tracking-normal">
                Your workspace
              </h1>
            </div>
            <UserButton />
          </header>
          <Card>
            <CardHeader>
              <CardTitle>Workspace setup unavailable</CardTitle>
              <CardDescription>
                Supagen could not load your workspace profile.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    );
  }

  if (!profileQuery.data) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <MaterialIcon
          className="animate-spin"
          aria-label="Loading profile"
          name="progress_activity"
        />
      </main>
    );
  }

  const profile = profileQuery.data;
  const primaryMembership = profile.memberships[0];
  const primaryWorkspace = primaryMembership?.workspaces[0];
  const displayName =
    profile.user.displayName ??
    user?.fullName ??
    user?.firstName ??
    user?.username ??
    "Signed-in user";
  const primaryEmail =
    profile.user.primaryEmail ??
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "No primary email";
  const initials = getProfileInitials(displayName, primaryEmail);

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Authenticated
            </Badge>
            <h1 className="font-heading text-3xl font-medium tracking-normal">
              Your workspace
            </h1>
          </div>
          <UserButton />
        </header>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage
                    src={profile.user.avatarUrl ?? user?.imageUrl}
                    alt=""
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle>{displayName}</CardTitle>
                  <CardDescription>{primaryEmail}</CardDescription>
                </div>
              </div>
              <Badge variant="outline">Supagen profile</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-3">
              <ProfileField
                icon={<MaterialIcon name="person" />}
                label="Name"
                value={displayName}
              />
              <ProfileField
                icon={<MaterialIcon name="mail" />}
                label="Email"
                value={primaryEmail}
              />
              <ProfileField
                icon={<MaterialIcon name="fingerprint" />}
                label="User ID"
                value={profile.user.id}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace access</CardTitle>
            <CardDescription>
              {primaryMembership?.organization.name ?? "No organization"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-3">
              <ProfileField
                icon={<MaterialIcon name="person" />}
                label="Role"
                value={primaryMembership?.role ?? "Unavailable"}
              />
              <ProfileField
                icon={<MaterialIcon name="fingerprint" />}
                label="Organization"
                value={primaryMembership?.organization.name ?? "Unavailable"}
              />
              <ProfileField
                icon={<MaterialIcon name="fingerprint" />}
                label="Workspace"
                value={primaryWorkspace?.name ?? "Unavailable"}
              />
            </dl>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 break-all text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
