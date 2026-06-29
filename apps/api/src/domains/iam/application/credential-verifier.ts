import type { Principal } from "../domain/principal";

export interface CredentialVerifier {
  verifyBearerToken(token: string): Promise<Principal>;
}
