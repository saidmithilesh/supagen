import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClerkClient, type ClerkClient } from "@clerk/backend";

import {
  RUNTIME_TRACER,
  type RuntimeTracer,
} from "../../../../infrastructure/runtime-telemetry";
import { IamIdentityProviderUnavailableError } from "../../application/iam.errors";
import type {
  IdentityProvider,
  IdentityProviderUser,
} from "../../application/identity-provider";
import type { ExternalIdentityRef } from "../../domain/principal";

@Injectable()
export class ClerkIdentityProvider implements IdentityProvider {
  private client: ClerkClient | null = null;

  constructor(
    private readonly config: ConfigService,
    @Inject(RUNTIME_TRACER)
    private readonly tracer: RuntimeTracer,
  ) {}

  async getUser(identity: ExternalIdentityRef): Promise<IdentityProviderUser> {
    return this.tracer.startActiveSpan(
      "iam.clerk_get_user",
      {
        "supagen.domain": "iam",
        "supagen.use_case": "bootstrap_current_profile",
        "identity.provider": identity.provider,
      },
      async () => {
        if (identity.provider !== "clerk") {
          throw new IamIdentityProviderUnavailableError();
        }

        try {
          const user = await this.getClient().users.getUser(identity.subject);
          const primaryEmail =
            user.emailAddresses.find(
              (email) => email.id === user.primaryEmailAddressId,
            )?.emailAddress ??
            user.emailAddresses[0]?.emailAddress ??
            null;

          return {
            provider: "clerk",
            subject: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            primaryEmail,
            avatarUrl: user.imageUrl || null,
          };
        } catch {
          throw new IamIdentityProviderUnavailableError();
        }
      },
    );
  }

  private getClient() {
    if (this.client) {
      return this.client;
    }

    const secretKey = this.config.get<string>("CLERK_SECRET_KEY");

    if (!secretKey) {
      throw new IamIdentityProviderUnavailableError();
    }

    this.client = createClerkClient({ secretKey });

    return this.client;
  }
}
