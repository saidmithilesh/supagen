import { Module } from "@nestjs/common";

import { BootstrapCurrentProfileUseCase } from "./application/bootstrap-current-profile.use-case";
import { GetCurrentProfileUseCase } from "./application/get-current-profile.use-case";
import {
  CreateIamWorkspaceUseCase,
  DeleteIamWorkspaceUseCase,
  GetIamWorkspaceUseCase,
  ListIamWorkspacesUseCase,
  UpdateIamWorkspaceUseCase,
} from "./application/workspace.use-cases";
import {
  IAM_CREDENTIAL_VERIFIER,
  IAM_IDENTITY_PROVIDER,
} from "./iam.constants";
import { ClerkCredentialVerifier } from "./infrastructure/clerk/clerk-credential-verifier";
import { ClerkIdentityProvider } from "./infrastructure/clerk/clerk-identity-provider";
import { IamProfileRepository } from "./infrastructure/iam-profile.repository";
import { IamWorkspaceRepository } from "./infrastructure/iam-workspace.repository";
import { IamAuthGuard } from "./presentation/iam-auth.guard";
import { IamProfileController } from "./presentation/profile.controller";
import { IamWorkspacesController } from "./presentation/workspaces.controller";

@Module({
  controllers: [IamProfileController, IamWorkspacesController],
  providers: [
    BootstrapCurrentProfileUseCase,
    CreateIamWorkspaceUseCase,
    DeleteIamWorkspaceUseCase,
    GetCurrentProfileUseCase,
    GetIamWorkspaceUseCase,
    IamAuthGuard,
    IamProfileRepository,
    IamWorkspaceRepository,
    ListIamWorkspacesUseCase,
    UpdateIamWorkspaceUseCase,
    {
      provide: IAM_CREDENTIAL_VERIFIER,
      useClass: ClerkCredentialVerifier,
    },
    {
      provide: IAM_IDENTITY_PROVIDER,
      useClass: ClerkIdentityProvider,
    },
  ],
})
export class IamModule {}
