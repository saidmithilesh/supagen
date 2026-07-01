import { Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";

import { BootstrapCurrentProfileUseCase } from "../application/bootstrap-current-profile.use-case";
import { GetCurrentProfileUseCase } from "../application/get-current-profile.use-case";
import type { Principal } from "../domain/principal";
import { CurrentPrincipal } from "./current-principal.decorator";
import { IamAuthGuard } from "./iam-auth.guard";
import { toIamHttpException } from "./iam-http-exceptions";

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
      throw toIamHttpException(error);
    }
  }

  @Post("bootstrap")
  @HttpCode(200)
  async bootstrapProfile(@CurrentPrincipal() principal: Principal) {
    try {
      return await this.bootstrapCurrentProfile.execute(principal);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }
}
