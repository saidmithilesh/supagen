import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const requireAuth = createServerFn().handler(async () => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) {
    throw redirect({
      to: "/auth",
      search: {
        mode: "sign-in",
        redirect_url: "/app",
      },
    });
  }

  return { userId };
});
