import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { Principal } from "../domain/principal";

export type AuthenticatedRequest = {
  principal?: Principal;
};

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.principal;
  },
);
