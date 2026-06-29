import type { ExternalIdentityRef } from "../domain/principal";

export type IdentityProviderUser = {
  provider: "clerk" | string;
  subject: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmail: string | null;
  avatarUrl: string | null;
};

export interface IdentityProvider {
  getUser(identity: ExternalIdentityRef): Promise<IdentityProviderUser>;
}
