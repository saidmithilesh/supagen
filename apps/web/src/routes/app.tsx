import { UserButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRoundIcon, LayersIcon } from "lucide-react";

import { requireAuth } from "../auth/require-auth";

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
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Authenticated app
            </Badge>
            <h1 className="font-heading text-3xl font-medium tracking-normal">
              Supagen workspace
            </h1>
          </div>
          <UserButton />
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRoundIcon />
                Clerk session
              </CardTitle>
              <CardDescription>
                This route is guarded before the app shell renders.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Product features can assume a signed-in user, while API calls must
              still enforce server-side authorization.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayersIcon />
                Application surface
              </CardTitle>
              <CardDescription>
                Domain-specific product modules will be added here later.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              This setup only establishes routing, providers, auth boundaries,
              and shared UI conventions.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
