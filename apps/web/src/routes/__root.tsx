import { ClerkProvider } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";

import appCss from "@supagen/ui/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Supagen",
      },
      {
        name: "description",
        content:
          "Supagen is a multi-modal AI gateway for product teams and solo founders.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-3 px-6">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="font-heading text-3xl font-medium tracking-normal">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        The page you requested does not exist.
      </p>
    </main>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

export function RootProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <RootProviders>{children}</RootProviders>
        <Scripts />
      </body>
    </html>
  );
}
