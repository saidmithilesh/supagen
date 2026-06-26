import { SignIn, SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@supagen/ui/components/card";
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
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Supagen</CardTitle>
          <CardDescription>
            Authentication is handled by Clerk. Supagen does not store or manage
            credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) => onModeChange(value as AuthMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign in</TabsTrigger>
              <TabsTrigger value="sign-up">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="pt-4">
              <SignIn
                fallbackRedirectUrl={redirectUrl}
                signUpUrl={`/auth?mode=sign-up&redirect_url=${encodeURIComponent(
                  redirectUrl,
                )}`}
              />
            </TabsContent>
            <TabsContent value="sign-up" className="pt-4">
              <SignUp
                fallbackRedirectUrl={redirectUrl}
                signInUrl={`/auth?mode=sign-in&redirect_url=${encodeURIComponent(
                  redirectUrl,
                )}`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
