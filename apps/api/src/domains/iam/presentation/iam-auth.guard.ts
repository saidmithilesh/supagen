import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import type { CredentialVerifier } from "../application/credential-verifier";
import { IAM_CREDENTIAL_VERIFIER } from "../iam.constants";
import type { AuthenticatedRequest } from "./current-principal.decorator";

@Injectable()
export class IamAuthGuard implements CanActivate {
  constructor(
    @Inject(IAM_CREDENTIAL_VERIFIER)
    private readonly credentialVerifier: CredentialVerifier,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<
      AuthenticatedRequest & {
        headers: Record<string, string | string[] | undefined>;
      }
    >();
    const token = parseBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException({ code: "IAM_UNAUTHENTICATED" });
    }

    try {
      request.principal =
        await this.credentialVerifier.verifyBearerToken(token);
    } catch {
      throw new UnauthorizedException({ code: "IAM_UNAUTHENTICATED" });
    }

    return true;
  }
}

function parseBearerToken(value: string | string[] | undefined) {
  const header = Array.isArray(value) ? value[0] : value;

  if (!header) {
    return null;
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token || rest.length > 0) {
    return null;
  }

  return token;
}
