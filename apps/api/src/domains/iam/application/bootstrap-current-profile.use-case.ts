import { Inject, Injectable } from "@nestjs/common";

import { UnitOfWork } from "../../../infrastructure/database";
import { IAM_IDENTITY_PROVIDER } from "../iam.constants";
import type { Principal } from "../domain/principal";
import { IamProfileRepository } from "../infrastructure/iam-profile.repository";
import {
  IamIdentityProviderSubjectMismatchError,
  IamProfileIncompleteError,
  IamUnsupportedPrincipalError,
} from "./iam.errors";
import type { IdentityProvider } from "./identity-provider";
import { deriveBootstrapNames, getDisplayName } from "./profile-naming";

@Injectable()
export class BootstrapCurrentProfileUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly profiles: IamProfileRepository,
    @Inject(IAM_IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async execute(principal: Principal) {
    if (principal.kind !== "human-user") {
      throw new IamUnsupportedPrincipalError();
    }

    const identity = {
      provider: principal.credential.provider,
      subject: principal.credential.providerSubject,
    };
    const providerUser = await this.identityProvider.getUser(identity);

    if (
      providerUser.provider !== identity.provider ||
      providerUser.subject !== identity.subject
    ) {
      throw new IamIdentityProviderSubjectMismatchError();
    }

    const names = deriveBootstrapNames(providerUser);

    return this.unitOfWork.transaction(async ({ db }) => {
      await this.profiles.lockBootstrapIdentity(db, identity);

      const existing = await this.profiles.findProfileByExternalIdentity(
        db,
        identity,
      );

      if (existing && this.profiles.isCompleteProfile(existing)) {
        return existing;
      }

      if (existing) {
        await this.profiles.repairBootstrapGraph(db, existing, {
          organization: { name: names.organizationName },
          workspace: { name: names.workspaceName },
        });
      } else {
        await this.profiles.createBootstrapGraph(db, {
          identity,
          user: {
            displayName: getDisplayName(providerUser),
            primaryEmail: providerUser.primaryEmail,
            avatarUrl: providerUser.avatarUrl,
          },
          organization: { name: names.organizationName },
          workspace: { name: names.workspaceName },
        });
      }

      const profile = await this.profiles.findProfileByExternalIdentity(
        db,
        identity,
      );

      if (!profile || !this.profiles.isCompleteProfile(profile)) {
        throw new IamProfileIncompleteError();
      }

      return profile;
    });
  }
}
