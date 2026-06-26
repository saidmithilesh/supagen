import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, BoxesIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@supagen/ui/components/badge";
import { Button } from "@supagen/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Supagen | Multi-modal AI gateway" },
      {
        name: "description",
        content:
          "Supagen gives product teams one integration surface for text, image, audio, and video generation.",
      },
    ],
  }),
});

export function LandingPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <div className="flex max-w-3xl flex-col gap-5">
          <Badge variant="secondary" className="w-fit">
            Multi-modal AI gateway
          </Badge>
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-4xl font-medium tracking-normal md:text-6xl">
              One integration surface for AI generation.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Supagen centralizes provider routing, templates, keys,
              observability, attribution, assets, and billing controls for early
              product teams.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/auth?mode=sign-up&redirect_url=/app">
                Start building
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/models">Browse models</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BoxesIcon />
                Provider routing
              </CardTitle>
              <CardDescription>
                Route generation requests across model providers through one
                application contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Public pages stay static and inspectable while the product
              workspace remains authenticated.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon />
                Governed access
              </CardTitle>
              <CardDescription>
                Clerk owns authentication while Supagen owns application
                workflows and product permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              The app shell is gated under <code>/app</code>, with server APIs
              expected to enforce auth independently.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
