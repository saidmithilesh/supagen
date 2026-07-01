import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IamProfile } from "../../api/iam-profile";
import { WorkspacesListPage } from "./WorkspacesListPage";

const clerkMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  useAuth: clerkMocks.useAuth,
  useUser: clerkMocks.useUser,
}));

describe(WorkspacesListPage.name, () => {
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

  it("groups workspace cards by organization and shows the org role", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(createProfile()));

    renderPage(<WorkspacesListPage />);

    expect(
      await screen.findByRole("heading", { name: "Your Workspaces" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Builder Org")).toBeInTheDocument();
    expect(screen.getByText("Growth Org")).toBeInTheDocument();
    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Builder Workspace" }),
    ).toHaveAttribute("href", "/app/workspaces/workspace_123/overview");
    expect(
      screen.getByRole("link", { name: "Growth Workspace" }),
    ).toHaveAttribute("href", "/app/workspaces/workspace_456/overview");
    expect(screen.getAllByText("Go to workspace")).toHaveLength(2);
    expect(screen.getByText("Shared prompt templates.")).toBeInTheDocument();
  });

  it("persists the selected workspace before following the card link", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(createProfile()));

    renderPage(<WorkspacesListPage />);

    await screen.findByRole("link", { name: "Builder Workspace" });
    const workspaceLink = screen.getByRole("link", {
      name: "Builder Workspace",
    });
    workspaceLink.addEventListener("click", (event) => {
      event.preventDefault();
    });
    workspaceLink.click();

    await waitFor(() => {
      expect(
        window.localStorage.getItem("supagen.workspace.lastVisitedId"),
      ).toBe("workspace_123");
    });
  });

  it("shows an empty state when memberships have no workspaces", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ...createProfile(),
        memberships: [
          {
            ...createProfile().memberships[0]!,
            workspaces: [],
          },
        ],
      }),
    );

    renderPage(<WorkspacesListPage />);

    expect(await screen.findByText("No workspace access")).toBeInTheDocument();
  });
});

function renderPage(children: ReactNode) {
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

function createProfile(): IamProfile {
  return {
    user: {
      id: "user_123",
      displayName: "User",
      primaryEmail: "user@example.com",
      avatarUrl: null,
    },
    memberships: [
      {
        role: "owner",
        organization: {
          id: "org_123",
          name: "Builder Org",
        },
        workspaces: [
          {
            id: "workspace_123",
            name: "Builder Workspace",
            description: "Shared prompt templates.",
          },
        ],
      },
      {
        role: "admin",
        organization: {
          id: "org_456",
          name: "Growth Org",
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
