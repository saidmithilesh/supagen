import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IamProfile } from "../../api/iam-profile";
import { WorkspaceOverviewPage } from "./WorkspaceShell";

const {
  bootstrapIamProfileMock,
  createIamWorkspaceMock,
  getIamProfileMock,
  signOutMock,
} = vi.hoisted(() => ({
  bootstrapIamProfileMock: vi.fn(),
  createIamWorkspaceMock: vi.fn(),
  getIamProfileMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  useAuth: () => ({
    getToken: async () => "session-token",
  }),
  useClerk: () => ({
    signOut: signOutMock,
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: "user_123",
    },
  }),
}));

vi.mock("../../api/iam-profile", () => ({
  bootstrapIamProfile: bootstrapIamProfileMock,
  createIamWorkspace: createIamWorkspaceMock,
  getIamProfile: getIamProfileMock,
  isIamProfileNotBootstrapped: () => false,
}));

describe(WorkspaceOverviewPage.name, () => {
  beforeEach(() => {
    getIamProfileMock.mockResolvedValue(createProfile());
    bootstrapIamProfileMock.mockReset();
    createIamWorkspaceMock.mockReset();
    createIamWorkspaceMock.mockResolvedValue({
      id: "workspace_new",
      name: "New Workspace",
      description: null,
      organization: {
        id: "org_123",
        name: "Mithilesh's Organization",
      },
      membershipRole: "owner",
    });
    signOutMock.mockClear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("light", "dark", "dark-warm");
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("renders the expanded workspace sidebar with real workspace data", async () => {
    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    expect(screen.getByLabelText("Supagen")).toHaveAttribute("href", "/app");
    expect(
      await screen.findByText("Mithilesh's Workspace"),
    ).toBeInTheDocument();
    expect(screen.getByText("Free plan")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/overview",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Templates" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/templates",
    );
    expect(screen.getByRole("link", { name: "API Keys" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/developer/api-keys",
    );
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace_123/billing",
    );
    expect(
      screen.getByRole("main", { name: "Workspace overview" }),
    ).toBeEmptyDOMElement();
  });

  it("opens the workspace dropdown with workspace actions", async () => {
    const user = userEvent.setup();

    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    await user.click(
      await screen.findByRole("button", {
        name: "Mithilesh's Workspace",
      }),
    );

    expect(
      screen.getByRole("menuitem", { name: "Mithilesh's Workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "All workspaces" }),
    ).toHaveAttribute("href", "/workspaces");
    expect(
      screen.getByRole("menuitem", { name: "Create workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Mithilesh's Organization"),
    ).not.toBeInTheDocument();
  });

  it("navigates to a selected workspace and persists it locally", async () => {
    const user = userEvent.setup();
    const onNavigateToWorkspace = vi.fn();
    getIamProfileMock.mockResolvedValueOnce(createMultiOrgProfile());

    renderWorkspace(
      <WorkspaceOverviewPage
        onNavigateToWorkspace={onNavigateToWorkspace}
        workspaceId="workspace_123"
      />,
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Mithilesh's Workspace",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Growth Labs" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Growth Workspace" }),
    );

    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      "workspace_456",
    );
    expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_456");
  });

  it("groups the workspace dropdown by org when the profile has multiple orgs", async () => {
    const user = userEvent.setup();
    getIamProfileMock.mockResolvedValueOnce(createMultiOrgProfile());

    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_456" />);

    await user.click(
      await screen.findByRole("button", {
        name: "Growth Workspace",
      }),
    );

    expect(
      screen.getAllByText("Mithilesh's Organization").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Growth Labs")).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Mithilesh's Workspace" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Growth Workspace" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Mithilesh's Organization" }),
    );

    expect(
      screen.getByRole("menuitem", { name: "Mithilesh's Workspace" }),
    ).toBeInTheDocument();
  });

  it("opens the profile dropdown with static links and active controls", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "supagen.workspace.lastVisitedId",
      "workspace_123",
    );

    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    await user.click(screen.getByRole("button", { name: "Mithilesh Said" }));

    expect(screen.getByText("mithilesh@supagen.dev")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/app/profile",
    );
    expect(screen.getByRole("menuitem", { name: "Invites" })).toHaveAttribute(
      "href",
      "/app/invites",
    );
    expect(
      screen.getByRole("menuitem", { name: "Admin Panel" }),
    ).toHaveAttribute("href", "/app/admin");

    await user.click(screen.getByRole("button", { name: "Dark Cool" }));

    expect(document.documentElement).toHaveClass("dark");

    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      null,
    );
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it("opens the create workspace dialog and creates a workspace", async () => {
    const user = userEvent.setup();
    const onNavigateToWorkspace = vi.fn();

    renderWorkspace(
      <WorkspaceOverviewPage
        onNavigateToWorkspace={onNavigateToWorkspace}
        workspaceId="workspace_123"
      />,
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Mithilesh's Workspace",
      }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Create workspace" }),
    );

    expect(
      screen.getByRole("heading", { name: "Create workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Mithilesh's Organization").length,
    ).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Name *"), "New Workspace");
    await user.type(
      screen.getByLabelText("Description"),
      "A focused workspace.",
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createIamWorkspaceMock).toHaveBeenCalledWith("session-token", {
        organizationId: "org_123",
        name: "New Workspace",
        description: "A focused workspace.",
      });
    });
    await waitFor(() => {
      expect(onNavigateToWorkspace).toHaveBeenCalledWith("workspace_new");
    });
    expect(window.localStorage.getItem("supagen.workspace.lastVisitedId")).toBe(
      "workspace_new",
    );
  });

  it("disables workspace creation when the user has no admin org", async () => {
    const user = userEvent.setup();
    getIamProfileMock.mockResolvedValueOnce(createMemberProfile());

    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    await user.click(
      await screen.findByRole("button", {
        name: "Mithilesh's Workspace",
      }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Create workspace" }),
    );

    expect(screen.getByText("Admin access required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You need admin access to an organization to create a workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("collapses the sidebar with local UI state only", async () => {
    const user = userEvent.setup();

    renderWorkspace(<WorkspaceOverviewPage workspaceId="workspace_123" />);

    await user.click(screen.getByRole("button", { name: "Collapse" }));

    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  });
});

function renderWorkspace(children: ReactNode) {
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

function createProfile(): IamProfile {
  return {
    user: {
      id: "user_123",
      displayName: "Mithilesh Said",
      primaryEmail: "mithilesh@supagen.dev",
      avatarUrl: null,
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

function createMultiOrgProfile(): IamProfile {
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

function createMemberProfile(): IamProfile {
  return {
    ...createProfile(),
    memberships: [
      {
        ...createProfile().memberships[0]!,
        role: "member",
      },
    ],
  };
}
