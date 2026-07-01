import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getProfileInitials } from "../auth/profile";
import { AppWorkspacePage } from "./app";

const clerkMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  useAuth: clerkMocks.useAuth,
  useUser: clerkMocks.useUser,
}));

describe(AppWorkspacePage.name, () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubEnv("VITE_SUPAGEN_API_URL", "");
    vi.stubGlobal("fetch", fetchMock);
    clerkMocks.useAuth.mockReturnValue({
      getToken: vi.fn(async () => "session-token"),
    });
    clerkMocks.useUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: "user_123",
      },
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("renders a loading state while Clerk user data loads", () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: false,
      user: null,
    });

    renderApp(<AppWorkspacePage />);

    expect(screen.getByLabelText("Loading workspace")).toBeInTheDocument();
  });

  it("navigates to a valid last visited workspace", async () => {
    const onNavigateToWorkspace = vi.fn();
    window.localStorage.setItem(
      "supagen.workspace.lastVisitedId",
      "workspace_456",
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(createMultiOrgProfile()));

    renderApp(
      <AppWorkspacePage onNavigateToWorkspace={onNavigateToWorkspace} />,
    );

    await waitFor(() => {
      expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_456");
    });
    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      "workspace_456",
    );
  });

  it("falls back to the first owner workspace when localStorage is stale", async () => {
    const onNavigateToWorkspace = vi.fn();
    window.localStorage.setItem(
      "supagen.workspace.lastVisitedId",
      "workspace_stale",
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(createMultiOrgProfile()));

    renderApp(
      <AppWorkspacePage onNavigateToWorkspace={onNavigateToWorkspace} />,
    );

    await waitFor(() => {
      expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_123");
    });
    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      "workspace_123",
    );
  });

  it("falls back to the first accessible workspace when the user owns no org", async () => {
    const onNavigateToWorkspace = vi.fn();
    fetchMock.mockResolvedValueOnce(jsonResponse(createAdminOnlyProfile()));

    renderApp(
      <AppWorkspacePage onNavigateToWorkspace={onNavigateToWorkspace} />,
    );

    await waitFor(() => {
      expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_456");
    });
    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      "workspace_456",
    );
  });

  it("bootstraps the Supagen profile when the backend reports it missing", async () => {
    const onNavigateToWorkspace = vi.fn();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ code: "IAM_PROFILE_NOT_BOOTSTRAPPED" }, 404),
      )
      .mockResolvedValueOnce(jsonResponse(createProfile()));

    renderApp(
      <AppWorkspacePage onNavigateToWorkspace={onNavigateToWorkspace} />,
    );

    await waitFor(() => {
      expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_123");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/iam/profile");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "GET",
      headers: {
        Authorization: "Bearer session-token",
      },
    });
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/iam/profile/bootstrap");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "Bearer session-token",
      },
    });
  });
});

describe(getProfileInitials.name, () => {
  it("uses name initials first", () => {
    expect(getProfileInitials("Mithilesh Said", "mith@supalabs.dev")).toBe(
      "MS",
    );
  });

  it("falls back to email initials", () => {
    expect(getProfileInitials("", "mith@supalabs.dev")).toBe("MI");
  });
});

function renderApp(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

function createProfile() {
  return {
    user: {
      id: "local-user-123",
      displayName: "Mithilesh Said",
      primaryEmail: "mith@supalabs.dev",
      avatarUrl: "https://example.com/avatar.png",
    },
    memberships: [
      {
        role: "owner",
        organization: {
          id: "org_123",
          name: "Mithilesh's Organization",
        },
        workspaces: [
          {
            id: "workspace_123",
            name: "Mithilesh's Workspace",
            description: null,
          },
        ],
      },
    ],
  };
}

function createMultiOrgProfile() {
  return {
    ...createProfile(),
    memberships: [
      ...createProfile().memberships,
      {
        role: "admin",
        organization: {
          id: "org_456",
          name: "Growth Labs",
        },
        workspaces: [
          {
            id: "workspace_456",
            name: "Growth Workspace",
            description: null,
          },
        ],
      },
    ],
  };
}

function createAdminOnlyProfile() {
  return {
    ...createProfile(),
    memberships: [createMultiOrgProfile().memberships[1]!],
  };
}
