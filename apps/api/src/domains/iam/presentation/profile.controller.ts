import {
  BadGatewayException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from "@nestjs/common";

import { BootstrapCurrentProfileUseCase } from "../application/bootstrap-current-profile.use-case";
import { GetCurrentProfileUseCase } from "../application/get-current-profile.use-case";
import {
  IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH,
  IAM_IDENTITY_PROVIDER_UNAVAILABLE,
  IAM_PROFILE_INCOMPLETE,
  IAM_PROFILE_NOT_BOOTSTRAPPED,
  IAM_UNSUPPORTED_PRINCIPAL,
  IamApplicationError,
} from "../application/iam.errors";
import type { Principal } from "../domain/principal";
import { CurrentPrincipal } from "./current-principal.decorator";
import { IamAuthGuard } from "./iam-auth.guard";

@Controller("iam/profile")
@UseGuards(IamAuthGuard)
export class IamProfileController {
  constructor(
    private readonly getCurrentProfile: GetCurrentProfileUseCase,
    private readonly bootstrapCurrentProfile: BootstrapCurrentProfileUseCase,
  ) {}

  @Get()
  async getProfile(@CurrentPrincipal() principal: Principal) {
    try {
      return await this.getCurrentProfile.execute(principal);
    } catch (error) {
      throw toHttpException(error);
    }
  }

  @Post("bootstrap")
  @HttpCode(200)
  async bootstrapProfile(@CurrentPrincipal() principal: Principal) {
    try {
      return await this.bootstrapCurrentProfile.execute(principal);
    } catch (error) {
      throw toHttpException(error);
    }
  }
}

function toHttpException(error: unknown) {
  if (!(error instanceof IamApplicationError)) {
    return error;
  }

  if (error.code === IAM_PROFILE_NOT_BOOTSTRAPPED) {
    return new NotFoundException({ code: error.code });
  }

  if (error.code === IAM_PROFILE_INCOMPLETE) {
    return new ConflictException({ code: error.code });
  }

  if (error.code === IAM_UNSUPPORTED_PRINCIPAL) {
    return new ForbiddenException({ code: error.code });
  }

  if (
    error.code === IAM_IDENTITY_PROVIDER_UNAVAILABLE ||
    error.code === IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH
  ) {
    return new BadGatewayException({ code: error.code });
  }

  return error;
}
