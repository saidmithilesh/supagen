import { UserButton, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
  FingerprintIcon,
  LoaderCircleIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import type { ReactNode } from "react";

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

  if (!isLoaded) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <LoaderCircleIcon
          className="animate-spin"
          aria-label="Loading profile"
        />
      </main>
    );
  }

  const displayName =
    user?.fullName ?? user?.firstName ?? user?.username ?? "Signed-in user";
  const primaryEmail =
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
              Your profile
            </h1>
          </div>
          <UserButton />
        </header>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage src={user?.imageUrl} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle>{displayName}</CardTitle>
                  <CardDescription>{primaryEmail}</CardDescription>
                </div>
              </div>
              <Badge variant="outline">Clerk user</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-3">
              <ProfileField
                icon={<UserIcon />}
                label="Name"
                value={displayName}
              />
              <ProfileField
                icon={<MailIcon />}
                label="Email"
                value={primaryEmail}
              />
              <ProfileField
                icon={<FingerprintIcon />}
                label="User ID"
                value={user?.id ?? "Unavailable"}
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
