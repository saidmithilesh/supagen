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
import {
  RUNTIME_LOGGER,
  RUNTIME_TRACER,
  type RuntimeLogger,
  type RuntimeTracer,
} from "../../../infrastructure/runtime-telemetry";

@Injectable()
export class IamAuthGuard implements CanActivate {
  constructor(
    @Inject(IAM_CREDENTIAL_VERIFIER)
    private readonly credentialVerifier: CredentialVerifier,
    @Inject(RUNTIME_LOGGER)
    private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER)
    private readonly tracer: RuntimeTracer,
  ) {}

  async canActivate(context: ExecutionContext) {
    return this.tracer.startActiveSpan(
      "iam.authenticate_request",
      {
        "supagen.domain": "iam",
        "supagen.use_case": "authenticate_request",
      },
      async () => {
        const request = context.switchToHttp().getRequest<
          AuthenticatedRequest & {
            headers: Record<string, string | string[] | undefined>;
          }
        >();
        const token = parseBearerToken(request.headers.authorization);

        if (!token) {
          this.logUnauthenticated();
          throw new UnauthorizedException({ code: "IAM_UNAUTHENTICATED" });
        }

        try {
          request.principal =
            await this.credentialVerifier.verifyBearerToken(token);
        } catch {
          this.logUnauthenticated();
          throw new UnauthorizedException({ code: "IAM_UNAUTHENTICATED" });
        }

        return true;
      },
    );
  }

  private logUnauthenticated() {
    this.logger.warn("iam_authentication_failed", {
      "supagen.domain": "iam",
      "supagen.use_case": "authenticate_request",
      "iam.outcome": "unauthenticated",
    });
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
