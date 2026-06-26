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
import { useEffect, useState } from "react";

import {
  applySupagenTheme,
  getSupagenThemeInitScript,
  resolveSupagenTheme,
} from "../theme/supagen-theme";

import appCss from "@supagen/ui/globals.css?url";

export const SUPAGEN_SITE_URL = "https://supagen.dev/";
export const SUPAGEN_META_TITLE =
  "Supagen — The Backend for AI Features & Agents";
export const SUPAGEN_META_DESCRIPTION =
  "Build faster without hardcoding prompts, model logic, and observability into your app. One integration point for prompts, routing, observability, and cost tracking across every LLM.";
export const SUPAGEN_SOCIAL_IMAGE = "https://supagen.dev/supagen-og-image.png";

export const X_CONVERSION_TRACKING_SCRIPT = `!(function (e, t, n, s, u, a) {
  e.twq ||
    ((s = e.twq =
      function () {
        s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
      }),
    (s.version = "1.1"),
    (s.queue = []),
    (u = t.createElement(n)),
    (u.async = true),
    (u.src = "https://static.ads-twitter.com/uwt.js"),
    (a = t.getElementsByTagName(n)[0]),
    a.parentNode.insertBefore(u, a));
})(window, document, "script");
twq("config", "rboc6");`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: SUPAGEN_META_TITLE,
      },
      {
        name: "description",
        content: SUPAGEN_META_DESCRIPTION,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SUPAGEN_SITE_URL },
      { property: "og:site_name", content: "Supagen" },
      { property: "og:title", content: SUPAGEN_META_TITLE },
      { property: "og:description", content: SUPAGEN_META_DESCRIPTION },
      {
        property: "og:image",
        content: SUPAGEN_SOCIAL_IMAGE,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: SUPAGEN_SITE_URL },
      { name: "twitter:title", content: SUPAGEN_META_TITLE },
      { name: "twitter:description", content: SUPAGEN_META_DESCRIPTION },
      {
        name: "twitter:image",
        content: SUPAGEN_SOCIAL_IMAGE,
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      { rel: "stylesheet", href: appCss },
    ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getSupagenThemeInitScript() }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: X_CONVERSION_TRACKING_SCRIPT }}
        />
        <HeadContent />
      </head>
      <body>
        <SupagenThemeRuntime />
        <RootProviders>{children}</RootProviders>
        <Scripts />
      </body>
    </html>
  );
}

function SupagenThemeRuntime() {
  useEffect(() => {
    applySupagenTheme(
      resolveSupagenTheme(window.localStorage, window.matchMedia),
      document.documentElement,
    );
  }, []);

  return null;
}
