import { Inject, Injectable } from "@nestjs/common";

import {
  DRIZZLE_DB,
  type DrizzleDatabase,
} from "../../../infrastructure/database";
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
  ) {}

  async execute(principal: Principal) {
    if (principal.kind !== "human-user") {
      throw new IamUnsupportedPrincipalError();
    }

    const profile = await this.profiles.findProfileByExternalIdentity(this.db, {
      provider: principal.credential.provider,
      subject: principal.credential.providerSubject,
    });

    if (!profile) {
      throw new IamProfileNotBootstrappedError();
    }

    if (!this.profiles.isCompleteProfile(profile)) {
      throw new IamProfileIncompleteError();
    }

    return profile;
  }
}
