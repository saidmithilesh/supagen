import { Inject, Injectable } from "@nestjs/common";

import { UnitOfWork } from "../../../infrastructure/database";
import {
  RUNTIME_LOGGER,
  RUNTIME_TRACER,
  type RuntimeLogger,
  type RuntimeTelemetryAttributes,
  type RuntimeTracer,
} from "../../../infrastructure/runtime-telemetry";
import { IAM_IDENTITY_PROVIDER } from "../iam.constants";
import type { Principal } from "../domain/principal";
import type { IamProfile } from "../domain/profile";
import { IamProfileRepository } from "../infrastructure/iam-profile.repository";
import {
  IamIdentityProviderSubjectMismatchError,
  IamIdentityProviderUnavailableError,
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
    @Inject(RUNTIME_LOGGER)
    private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER)
    private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal) {
    return this.tracer.startActiveSpan(
      "iam.bootstrap_current_profile",
      {
        "supagen.domain": "iam",
        "supagen.use_case": "bootstrap_current_profile",
      },
      async () => {
        if (principal.kind !== "human-user") {
          this.logBootstrapFailure("unsupported_principal");
          throw new IamUnsupportedPrincipalError();
        }

        const identity = {
          provider: principal.credential.provider,
          subject: principal.credential.providerSubject,
        };
        const providerUser = await this.getProviderUser(identity);

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
            this.logBootstrapTransition("bootstrap_existing", existing);
            return existing;
          }

          const outcome = existing ? "bootstrap_repaired" : "bootstrap_created";

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
            this.logBootstrapFailure("incomplete_profile");
            throw new IamProfileIncompleteError();
          }

          this.logBootstrapTransition(outcome, profile);

          return profile;
        });
      },
    );
  }

  private async getProviderUser(identity: {
    provider: string;
    subject: string;
  }) {
    try {
      return await this.identityProvider.getUser(identity);
    } catch (error) {
      if (error instanceof IamIdentityProviderUnavailableError) {
        this.logBootstrapFailure("clerk_unavailable", {}, error);
      }

      throw error;
    }
  }

  private logBootstrapFailure(
    outcome:
      | "unsupported_principal"
      | "incomplete_profile"
      | "clerk_unavailable",
    attributes: RuntimeTelemetryAttributes = {},
    error?: unknown,
  ) {
    this.logger.warn(
      "iam_profile_bootstrap_failed",
      {
        "supagen.domain": "iam",
        "supagen.use_case": "bootstrap_current_profile",
        "iam.outcome": outcome,
        ...attributes,
      },
      error,
    );
  }

  private logBootstrapTransition(
    outcome: "bootstrap_existing" | "bootstrap_created" | "bootstrap_repaired",
    profile: IamProfile,
  ) {
    this.logger.info("iam_profile_bootstrap_completed", {
      "supagen.domain": "iam",
      "supagen.use_case": "bootstrap_current_profile",
      "iam.outcome": outcome,
      ...getProfileTelemetryIds(profile),
    });
  }
}

function getProfileTelemetryIds(profile: IamProfile) {
  const firstMembership = profile.memberships[0];
  const firstWorkspace = firstMembership?.workspaces[0];

  return {
    userId: profile.user.id,
    ...(firstMembership
      ? { organizationId: firstMembership.organization.id }
      : {}),
    ...(firstWorkspace ? { workspaceId: firstWorkspace.id } : {}),
  };
}
