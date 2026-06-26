import { SignIn, SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@supagen/ui/components/tabs";

type AuthMode = "sign-in" | "sign-up";

type AuthSearch = {
  mode: AuthMode;
  redirect_url: string;
};

const AUTH_COPY = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to continue to Supagen",
  },
  "sign-up": {
    title: "Start building",
    subtitle: "Sign up to start building with Supagen",
  },
} satisfies Record<AuthMode, { title: string; subtitle: string }>;

const clerkAppearance = {
  variables: {
    borderRadius: "var(--radius)",
    colorBackground: "var(--card)",
    colorInputBackground: "var(--input)",
    colorPrimary: "var(--primary)",
    colorText: "var(--card-foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    fontFamily: "var(--font-sans)",
  },
  options: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  elements: {
    card: "w-full max-w-full border-border bg-card shadow-sm",
    cardBox: "w-full max-w-full shadow-none",
    footer: "!hidden",
    footerAction: "!hidden",
    footerActionLink: "!hidden",
    footerActionText: "!hidden",
    footerPageLink: "!hidden",
    footerPages: "!hidden",
    footerPagesLink: "!hidden",
    footerPagesText: "!hidden",
    form: "w-full",
    formFieldInput: "w-full",
    headerSubtitle: "hidden",
    headerTitle: "hidden",
    logoBox: "!hidden",
    logoImage: "!hidden",
    logoLink: "!hidden",
    main: "w-full",
    rootBox: "w-full max-w-full",
    socialButtons: "w-full",
    socialButtonsBlockButton: "w-full",
  },
} as const;

export const Route = createFileRoute("/auth")({
  validateSearch: normalizeAuthSearch,
  component: AuthRoute,
  head: () => ({
    meta: [
      { title: "Auth | Supagen" },
      {
        name: "description",
        content: "Sign in or sign up for the Supagen application workspace.",
      },
    ],
  }),
});

export function normalizeAuthSearch(
  search: Record<string, unknown>,
): AuthSearch {
  const mode = search.mode === "sign-up" ? "sign-up" : "sign-in";
  const redirectUrl =
    typeof search.redirect_url === "string" && search.redirect_url.length > 0
      ? search.redirect_url
      : "/app";

  return {
    mode,
    redirect_url: redirectUrl,
  };
}

function AuthRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <AuthPanel
      mode={search.mode}
      redirectUrl={search.redirect_url}
      onModeChange={(mode) => {
        void navigate({
          search: {
            mode,
            redirect_url: search.redirect_url,
          },
        });
      }}
    />
  );
}

export function AuthPanel({
  mode,
  redirectUrl,
  onModeChange,
}: {
  mode: AuthMode;
  redirectUrl: string;
  onModeChange: (mode: AuthMode) => void;
}) {
  const copy = AUTH_COPY[mode];
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);

  return (
    <main className="grid h-svh overflow-hidden bg-background text-foreground lg:grid-cols-2">
      <section className="relative hidden min-w-0 overflow-hidden border-r border-border bg-surface lg:flex">
        <img
          src="/auth-hero.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85" />
        <div className="relative flex h-svh w-full flex-col justify-between px-10 py-10 2xl:p-14">
          <a href="/" className="flex w-fit items-center gap-3 font-semibold">
            <img src="/logo.svg" alt="" className="size-9" />
            <span>Supagen</span>
          </a>

          <div className="flex max-w-[680px] flex-col gap-5">
            <h1 className="font-heading text-5xl leading-tight font-semibold tracking-normal">
              Build AI features without wiring every provider by hand.
            </h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              Supagen gives your product one control plane for prompts, model
              routing, keys, observability, usage, and end-user AI consumption.
            </p>
          </div>

          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Ship experiments quickly. Keep the operational details visible as
            your AI stack grows.
          </p>
        </div>
      </section>

      <section className="flex h-svh min-w-0 items-center justify-center overflow-hidden px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex w-full min-w-0 max-w-[400px] flex-col gap-4">
          <div className="flex items-stretch gap-4">
            <img
              src="/logo.svg"
              alt=""
              className="aspect-square h-auto min-h-0 w-auto shrink-0 self-stretch object-contain"
            />
            <div className="flex min-w-0 flex-col justify-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-normal">
                {copy.title}
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
          </div>

          <Tabs
            className="w-full min-w-0"
            value={mode}
            onValueChange={(value) => onModeChange(value as AuthMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="sign-in"
                className="data-active:!bg-border-strong data-active:!text-foreground data-active:ring-1 data-active:ring-border-strong"
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="sign-up"
                className="data-active:!bg-border-strong data-active:!text-foreground data-active:ring-1 data-active:ring-border-strong"
              >
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="w-full min-w-0 pt-4">
              <SignIn
                appearance={clerkAppearance}
                fallbackRedirectUrl={redirectUrl}
                forceRedirectUrl={redirectUrl}
                signUpUrl={`/auth?mode=sign-up&redirect_url=${encodedRedirectUrl}`}
              />
            </TabsContent>
            <TabsContent value="sign-up" className="w-full min-w-0 pt-4">
              <SignUp
                appearance={clerkAppearance}
                fallbackRedirectUrl={redirectUrl}
                forceRedirectUrl={redirectUrl}
                signInUrl={`/auth?mode=sign-in&redirect_url=${encodedRedirectUrl}`}
              />
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to Supagen&apos;s{" "}
            <a href="/terms" className="font-medium text-foreground underline">
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="font-medium text-foreground underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
