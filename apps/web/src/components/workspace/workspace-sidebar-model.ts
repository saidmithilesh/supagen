import type { IamProfile } from "../../api/iam-profile";

export type NavItem = {
  icon: string;
  label: string;
  segment: string;
};

export type SidebarWorkspace = {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
};

export type WorkspaceGroup = {
  id: string;
  name: string;
  workspaces: SidebarWorkspace[];
};

export type WorkspaceSwitcherData = {
  currentWorkspace: SidebarWorkspace;
  groups: WorkspaceGroup[];
  shouldShowOrgGroups: boolean;
};

export const WORKSPACE_PLAN = "Free plan";

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    icon: "space_dashboard",
    label: "Overview",
    segment: "overview",
  },
  {
    icon: "description",
    label: "Templates",
    segment: "templates",
  },
  {
    icon: "receipt_long",
    label: "Invocations",
    segment: "invocations",
  },
  {
    icon: "query_stats",
    label: "Analytics",
    segment: "analytics",
  },
  {
    icon: "group",
    label: "Members",
    segment: "members",
  },
];

export const DEVELOPER_NAV_ITEMS: NavItem[] = [
  {
    icon: "key",
    label: "API Keys",
    segment: "developer/api-keys",
  },
  {
    icon: "vpn_key",
    label: "LLM Keys",
    segment: "developer/llm-keys",
  },
  {
    icon: "cable",
    label: "Connect MCP",
    segment: "developer/connect-mcp",
  },
  {
    icon: "model_training",
    label: "Models",
    segment: "developer/models",
  },
];

export const UTILITY_NAV_ITEMS: NavItem[] = [
  {
    icon: "help",
    label: "Help & Docs",
    segment: "help",
  },
  {
    icon: "notifications",
    label: "Notifications",
    segment: "notifications",
  },
];

export function getWorkspaceSwitcherData(
  profile: IamProfile | undefined,
  workspaceId: string,
): WorkspaceSwitcherData {
  const groups =
    profile?.memberships
      .map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        workspaces: membership.workspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          orgId: membership.organization.id,
          orgName: membership.organization.name,
        })),
      }))
      .filter((group) => group.workspaces.length > 0) ?? [];
  const allWorkspaces = groups.flatMap((group) => group.workspaces);
  const fallbackWorkspace = {
    id: workspaceId,
    name: "Workspace",
    orgId: "current",
    orgName: "Current organization",
  };
  const currentWorkspace =
    allWorkspaces.find((workspace) => workspace.id === workspaceId) ??
    fallbackWorkspace;

  return {
    currentWorkspace,
    groups:
      groups.length > 0
        ? groups
        : [
            {
              id: fallbackWorkspace.orgId,
              name: fallbackWorkspace.orgName,
              workspaces: [fallbackWorkspace],
            },
          ],
    shouldShowOrgGroups: groups.length > 1,
  };
}

export function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "W";
}
