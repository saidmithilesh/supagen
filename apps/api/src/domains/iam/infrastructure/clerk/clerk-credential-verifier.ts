import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verifyToken } from "@clerk/backend";

import type { CredentialVerifier } from "../../application/credential-verifier";
import type { Principal } from "../../domain/principal";

@Injectable()
export class ClerkCredentialVerifier implements CredentialVerifier {
  constructor(private readonly config: ConfigService) {}

  async verifyBearerToken(token: string): Promise<Principal> {
    const payload = await verifyToken(token, {
      secretKey: this.config.get<string>("CLERK_SECRET_KEY"),
      jwtKey: this.config.get<string>("CLERK_JWT_KEY"),
      authorizedParties: parseCsv(
        this.config.get<string>("CLERK_AUTHORIZED_PARTIES"),
      ),
    });
    const providerSubject =
      typeof payload.sub === "string" ? payload.sub : null;

    if (!providerSubject) {
      throw new Error("Clerk token is missing a subject.");
    }

    return {
      kind: "human-user",
      credential: {
        type: "clerk-session",
        provider: "clerk",
        providerSubject,
        sessionId: typeof payload.sid === "string" ? payload.sid : null,
      },
      actor: {
        type: "human-user",
        externalIdentity: {
          provider: "clerk",
          subject: providerSubject,
        },
      },
      scopes: [],
    };
  }
}

function parseCsv(value: string | undefined) {
  const values = value
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return values && values.length > 0 ? values : undefined;
}
