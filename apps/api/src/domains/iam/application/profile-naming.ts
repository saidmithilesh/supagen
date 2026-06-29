import type { IdentityProviderUser } from "./identity-provider";

export function getDisplayName(user: IdentityProviderUser) {
  const fullName = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || clean(user.username) || clean(user.primaryEmail);
}

export function deriveBootstrapNames(user: IdentityProviderUser) {
  const seed =
    clean(user.firstName) ??
    getDisplayName(user) ??
    clean(user.primaryEmail?.split("@")[0]);

  if (!seed) {
    return {
      organizationName: "My Organization",
      workspaceName: "My Workspace",
    };
  }

  return {
    organizationName: `${seed}'s Organization`,
    workspaceName: `${seed}'s Workspace`,
  };
}

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
