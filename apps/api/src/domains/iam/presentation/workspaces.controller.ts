import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import {
  CreateIamWorkspaceUseCase,
  DeleteIamWorkspaceUseCase,
  GetIamWorkspaceUseCase,
  ListIamWorkspacesUseCase,
  UpdateIamWorkspaceUseCase,
} from "../application/workspace.use-cases";
import type { Principal } from "../domain/principal";
import { CurrentPrincipal } from "./current-principal.decorator";
import { IamAuthGuard } from "./iam-auth.guard";
import { toIamHttpException } from "./iam-http-exceptions";

@Controller("iam/workspaces")
@UseGuards(IamAuthGuard)
export class IamWorkspacesController {
  constructor(
    private readonly listWorkspaces: ListIamWorkspacesUseCase,
    private readonly getWorkspace: GetIamWorkspaceUseCase,
    private readonly createWorkspace: CreateIamWorkspaceUseCase,
    private readonly updateWorkspace: UpdateIamWorkspaceUseCase,
    private readonly deleteWorkspace: DeleteIamWorkspaceUseCase,
  ) {}

  @Get()
  async list(@CurrentPrincipal() principal: Principal) {
    try {
      return await this.listWorkspaces.execute(principal);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }

  @Get(":workspaceId")
  async get(
    @CurrentPrincipal() principal: Principal,
    @Param("workspaceId") workspaceId: string,
  ) {
    try {
      return await this.getWorkspace.execute(principal, workspaceId);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }

  @Post()
  async create(
    @CurrentPrincipal() principal: Principal,
    @Body() body: unknown,
  ) {
    try {
      return await this.createWorkspace.execute(principal, body);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }

  @Patch(":workspaceId")
  async update(
    @CurrentPrincipal() principal: Principal,
    @Param("workspaceId") workspaceId: string,
    @Body() body: unknown,
  ) {
    try {
      return await this.updateWorkspace.execute(principal, workspaceId, body);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }

  @Delete(":workspaceId")
  @HttpCode(204)
  async delete(
    @CurrentPrincipal() principal: Principal,
    @Param("workspaceId") workspaceId: string,
  ) {
    try {
      await this.deleteWorkspace.execute(principal, workspaceId);
    } catch (error) {
      throw toIamHttpException(error);
    }
  }
}
