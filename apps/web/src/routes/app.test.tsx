import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getProfileInitials } from "../auth/profile";
import { AppWorkspacePage } from "./app";

const clerkMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  UserButton: () => <button type="button">User menu</button>,
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
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders a loading state while Clerk user data loads", () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: false,
      user: null,
    });

    renderApp(<AppWorkspacePage />);

    expect(screen.getByLabelText("Loading profile")).toBeInTheDocument();
  });

  it("renders the signed-in user's Supagen profile details", async () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: true,
      user: {
        emailAddresses: [],
        firstName: "Mithilesh",
        fullName: "Mithilesh Said",
        id: "user_123",
        imageUrl: "https://example.com/avatar.png",
        primaryEmailAddress: {
          emailAddress: "mith@supalabs.dev",
        },
        username: null,
      },
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(createProfile()));

    renderApp(<AppWorkspacePage />);

    expect(
      await screen.findByRole("heading", { name: "Your workspace" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Mithilesh Said")[0]).toBeInTheDocument();
    expect(screen.getAllByText("mith@supalabs.dev")[0]).toBeInTheDocument();
    expect(screen.getByText("local-user-123")).toBeInTheDocument();
    expect(
      screen.getAllByText("Mithilesh's Organization")[0],
    ).toBeInTheDocument();
    expect(screen.getByText("Mithilesh's Workspace")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "User menu" }),
    ).toBeInTheDocument();
  });

  it("bootstraps the Supagen profile when the backend reports it missing", async () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: true,
      user: {
        emailAddresses: [],
        firstName: "Mithilesh",
        fullName: "Mithilesh Said",
        id: "user_123",
        imageUrl: "https://example.com/avatar.png",
        primaryEmailAddress: {
          emailAddress: "mith@supalabs.dev",
        },
        username: null,
      },
    });
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ code: "IAM_PROFILE_NOT_BOOTSTRAPPED" }, 404),
      )
      .mockResolvedValueOnce(jsonResponse(createProfile()));

    renderApp(<AppWorkspacePage />);

    expect(
      await screen.findByText("Mithilesh's Workspace"),
    ).toBeInTheDocument();
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
          },
        ],
      },
    ],
  };
}
