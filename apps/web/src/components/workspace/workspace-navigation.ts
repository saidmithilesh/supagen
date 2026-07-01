import type { IamProfile } from "../../api/iam-profile";

export const LAST_VISITED_WORKSPACE_STORAGE_KEY =
  "supagen.workspace.lastVisitedId";

export function getLastVisitedWorkspaceId(storage: Storage) {
  return storage.getItem(LAST_VISITED_WORKSPACE_STORAGE_KEY);
}

export function persistLastVisitedWorkspaceId(
  storage: Storage,
  workspaceId: string,
) {
  storage.setItem(LAST_VISITED_WORKSPACE_STORAGE_KEY, workspaceId);
}

export function clearLastVisitedWorkspaceId(storage: Storage) {
  storage.removeItem(LAST_VISITED_WORKSPACE_STORAGE_KEY);
}

export function findWorkspaceInProfile(
  profile: IamProfile,
  workspaceId: string,
) {
  for (const membership of profile.memberships) {
    const workspace = membership.workspaces.find(
      (workspace) => workspace.id === workspaceId,
    );

    if (workspace) {
      return {
        membership,
        workspace,
      };
    }
  }

  return null;
}

export function resolveWorkspaceIdForApp(
  profile: IamProfile,
  storage: Storage,
) {
  const storedWorkspaceId = getLastVisitedWorkspaceId(storage);

  if (storedWorkspaceId && findWorkspaceInProfile(profile, storedWorkspaceId)) {
    return storedWorkspaceId;
  }

  if (storedWorkspaceId) {
    clearLastVisitedWorkspaceId(storage);
  }

  const ownerWorkspace = profile.memberships
    .find((membership) => membership.role === "owner")
    ?.workspaces.at(0);
  const firstAccessibleWorkspace = profile.memberships.at(0)?.workspaces.at(0);
  const workspaceId = ownerWorkspace?.id ?? firstAccessibleWorkspace?.id;

  if (workspaceId) {
    persistLastVisitedWorkspaceId(storage, workspaceId);
  }

  return workspaceId ?? null;
}
