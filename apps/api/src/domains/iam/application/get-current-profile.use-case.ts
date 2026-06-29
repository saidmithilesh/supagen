import { Inject, Injectable } from "@nestjs/common";

import {
  DRIZZLE_DB,
  type DrizzleDatabase,
} from "../../../infrastructure/database";
import {
  RUNTIME_LOGGER,
  RUNTIME_TRACER,
  type RuntimeLogger,
  type RuntimeTracer,
} from "../../../infrastructure/runtime-telemetry";
import type { Principal } from "../domain/principal";
import { IamProfileRepository } from "../infrastructure/iam-profile.repository";
import {
  IamProfileIncompleteError,
  IamProfileNotBootstrappedError,
  IamUnsupportedPrincipalError,
} from "./iam.errors";

@Injectable()
export class GetCurrentProfileUseCase {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly profiles: IamProfileRepository,
    @Inject(RUNTIME_LOGGER)
    private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER)
    private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal) {
    return this.tracer.startActiveSpan(
      "iam.get_current_profile",
      {
        "supagen.domain": "iam",
        "supagen.use_case": "get_current_profile",
      },
      async () => {
        if (principal.kind !== "human-user") {
          this.logProfileFailure("unsupported_principal");
          throw new IamUnsupportedPrincipalError();
        }

        const profile = await this.profiles.findProfileByExternalIdentity(
          this.db,
          {
            provider: principal.credential.provider,
            subject: principal.credential.providerSubject,
          },
        );

        if (!profile) {
          this.logProfileFailure("profile_not_bootstrapped");
          throw new IamProfileNotBootstrappedError();
        }

        if (!this.profiles.isCompleteProfile(profile)) {
          this.logProfileFailure("incomplete_profile", {
            userId: profile.user.id,
          });
          throw new IamProfileIncompleteError();
        }

        return profile;
      },
    );
  }

  private logProfileFailure(
    outcome:
      | "unsupported_principal"
      | "profile_not_bootstrapped"
      | "incomplete_profile",
    attributes: Record<string, string> = {},
  ) {
    this.logger.warn("iam_profile_lookup_failed", {
      "supagen.domain": "iam",
      "supagen.use_case": "get_current_profile",
      "iam.outcome": outcome,
      ...attributes,
    });
  }
}
