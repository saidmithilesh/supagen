import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, ListFilterIcon } from "lucide-react";

import { Badge } from "@supagen/ui/components/badge";
import { Button } from "@supagen/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";

const modelGroups = [
  {
    name: "Text",
    description: "Language models for generation, reasoning, and extraction.",
  },
  {
    name: "Image",
    description: "Image generation and editing providers behind one API.",
  },
  {
    name: "Audio",
    description: "Speech, transcription, and audio generation capabilities.",
  },
  {
    name: "Video",
    description: "Video generation providers prepared for catalog expansion.",
  },
];

export const Route = createFileRoute("/models")({
  component: ModelsCatalogPage,
  head: () => ({
    meta: [
      { title: "Models | Supagen" },
      {
        name: "description",
        content:
          "Explore the Supagen model catalog for text, image, audio, and video generation providers.",
      },
    ],
  }),
});

export function ModelsCatalogPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 md:py-20">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Model catalog
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-4xl font-medium tracking-normal md:text-5xl">
              Catalog routes are ready for SEO pages.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              This static shell establishes the public route for future model
              discovery content without defining catalog details too early.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {modelGroups.map((group) => (
            <Card key={group.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListFilterIcon />
                  {group.name}
                </CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <a href="/auth?mode=sign-up&redirect_url=/app">
                    Open workspace
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
