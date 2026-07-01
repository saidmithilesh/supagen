import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  DRIZZLE_DB,
  type DrizzleDatabase,
  UnitOfWork,
} from "../../../infrastructure/database";
import {
  RUNTIME_LOGGER,
  RUNTIME_TRACER,
  type RuntimeLogger,
  type RuntimeTelemetryAttributes,
  type RuntimeTracer,
} from "../../../infrastructure/runtime-telemetry";
import type { ExternalIdentityRef, Principal } from "../domain/principal";
import {
  IamWorkspaceRepository,
  type IamWorkspaceRecord,
} from "../infrastructure/iam-workspace.repository";
import {
  IamUnsupportedPrincipalError,
  IamWorkspaceForbiddenError,
  IamWorkspaceInvalidInputError,
  IamWorkspaceLastInOrganizationError,
  IamWorkspaceNotFoundError,
} from "./iam.errors";

const workspaceIdSchema = z.string().uuid();
const workspaceNameSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1).max(100));
const workspaceDescriptionSchema = z.string().nullable().optional();

const createWorkspaceSchema = z.object({
  organizationId: z.string().uuid(),
  name: workspaceNameSchema,
  description: workspaceDescriptionSchema.transform(normalizeDescription),
});

const updateWorkspaceSchema = z
  .object({
    name: workspaceNameSchema.optional(),
    description: workspaceDescriptionSchema,
  })
  .refine(
    (value) =>
      Object.prototype.hasOwnProperty.call(value, "name") ||
      Object.prototype.hasOwnProperty.call(value, "description"),
  )
  .transform((value) => ({
    ...(value.name === undefined ? {} : { name: value.name }),
    ...(Object.prototype.hasOwnProperty.call(value, "description")
      ? { description: normalizeDescription(value.description) }
      : {}),
  }));

@Injectable()
export class ListIamWorkspacesUseCase {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly workspaces: IamWorkspaceRepository,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER) private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal) {
    return this.tracer.startActiveSpan(
      "iam.list_workspaces",
      workspaceTelemetry("list_workspaces"),
      async () => {
        const identity = getHumanIdentity(principal);
        const workspaces = await this.workspaces.listAccessibleWorkspaces(
          this.db,
          identity,
        );

        this.logSuccess("list_completed", {
          workspaceCount: workspaces.length,
        });

        return workspaces;
      },
    );
  }

  private logSuccess(outcome: string, attributes: RuntimeTelemetryAttributes) {
    this.logger.info("iam_workspace_list_completed", {
      ...workspaceTelemetry("list_workspaces"),
      "iam.outcome": outcome,
      ...attributes,
    });
  }
}

@Injectable()
export class GetIamWorkspaceUseCase {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly workspaces: IamWorkspaceRepository,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER) private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal, workspaceIdInput: string) {
    const workspaceId = parseWorkspaceId(workspaceIdInput);

    return this.tracer.startActiveSpan(
      "iam.get_workspace",
      workspaceTelemetry("get_workspace", { workspaceId }),
      async () => {
        const identity = getHumanIdentity(principal);
        const access = await this.workspaces.findWorkspaceAccess(
          this.db,
          identity,
          workspaceId,
        );

        if (!access) {
          logWorkspaceFailure(this.logger, "get_workspace", "not_found", {
            workspaceId,
          });
          throw new IamWorkspaceNotFoundError();
        }

        this.logger.info("iam_workspace_get_completed", {
          ...workspaceTelemetry("get_workspace", {
            userId: access.userId,
            organizationId: access.organization.id,
            workspaceId,
          }),
          "iam.outcome": "get_completed",
        });

        return toWorkspaceRecord(access);
      },
    );
  }
}

@Injectable()
export class CreateIamWorkspaceUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly workspaces: IamWorkspaceRepository,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER) private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal, input: unknown) {
    const data = parseWorkspaceInput(createWorkspaceSchema, input);

    return this.tracer.startActiveSpan(
      "iam.create_workspace",
      workspaceTelemetry("create_workspace", {
        organizationId: data.organizationId,
      }),
      async () =>
        this.unitOfWork.transaction(async ({ db }) => {
          const identity = getHumanIdentity(principal);
          const access = await this.workspaces.findOrganizationAccess(
            db,
            identity,
            data.organizationId,
          );

          if (!access) {
            logWorkspaceFailure(
              this.logger,
              "create_workspace",
              "organization_not_found",
              { organizationId: data.organizationId },
            );
            throw new IamWorkspaceForbiddenError();
          }

          if (!canAdministerWorkspace(access.role)) {
            logWorkspaceFailure(this.logger, "create_workspace", "forbidden", {
              userId: access.userId,
              organizationId: access.organization.id,
            });
            throw new IamWorkspaceForbiddenError();
          }

          const workspace = await this.workspaces.createWorkspace(db, {
            organization: access.organization,
            membershipRole: access.role,
            name: data.name,
            description: data.description,
          });

          this.logger.info("iam_workspace_create_completed", {
            ...workspaceTelemetry("create_workspace", {
              userId: access.userId,
              organizationId: access.organization.id,
              workspaceId: workspace.id,
            }),
            "iam.outcome": "create_completed",
          });

          return workspace;
        }),
    );
  }
}

@Injectable()
export class UpdateIamWorkspaceUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly workspaces: IamWorkspaceRepository,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER) private readonly tracer: RuntimeTracer,
  ) {}

  async execute(
    principal: Principal,
    workspaceIdInput: string,
    input: unknown,
  ) {
    const workspaceId = parseWorkspaceId(workspaceIdInput);
    const data = parseWorkspaceInput(updateWorkspaceSchema, input);

    return this.tracer.startActiveSpan(
      "iam.update_workspace",
      workspaceTelemetry("update_workspace", { workspaceId }),
      async () =>
        this.unitOfWork.transaction(async ({ db }) => {
          const identity = getHumanIdentity(principal);
          const access = await this.workspaces.findWorkspaceAccess(
            db,
            identity,
            workspaceId,
          );

          if (!access) {
            logWorkspaceFailure(this.logger, "update_workspace", "not_found", {
              workspaceId,
            });
            throw new IamWorkspaceNotFoundError();
          }

          if (!canAdministerWorkspace(access.role)) {
            logWorkspaceFailure(this.logger, "update_workspace", "forbidden", {
              userId: access.userId,
              organizationId: access.organization.id,
              workspaceId,
            });
            throw new IamWorkspaceForbiddenError();
          }

          const workspace = await this.workspaces.updateWorkspace(
            db,
            access,
            data,
          );

          this.logger.info("iam_workspace_update_completed", {
            ...workspaceTelemetry("update_workspace", {
              userId: access.userId,
              organizationId: access.organization.id,
              workspaceId,
            }),
            "iam.outcome": "update_completed",
          });

          return workspace;
        }),
    );
  }
}

@Injectable()
export class DeleteIamWorkspaceUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly workspaces: IamWorkspaceRepository,
    @Inject(RUNTIME_LOGGER) private readonly logger: RuntimeLogger,
    @Inject(RUNTIME_TRACER) private readonly tracer: RuntimeTracer,
  ) {}

  async execute(principal: Principal, workspaceIdInput: string) {
    const workspaceId = parseWorkspaceId(workspaceIdInput);

    return this.tracer.startActiveSpan(
      "iam.delete_workspace",
      workspaceTelemetry("delete_workspace", { workspaceId }),
      async () =>
        this.unitOfWork.transaction(async ({ db }) => {
          const identity = getHumanIdentity(principal);
          const access = await this.workspaces.findWorkspaceAccess(
            db,
            identity,
            workspaceId,
          );

          if (!access) {
            logWorkspaceFailure(this.logger, "delete_workspace", "not_found", {
              workspaceId,
            });
            throw new IamWorkspaceNotFoundError();
          }

          if (access.role !== "owner") {
            logWorkspaceFailure(this.logger, "delete_workspace", "forbidden", {
              userId: access.userId,
              organizationId: access.organization.id,
              workspaceId,
            });
            throw new IamWorkspaceForbiddenError();
          }

          const workspaceCount =
            await this.workspaces.countOrganizationWorkspaces(
              db,
              access.organization.id,
            );

          if (workspaceCount <= 1) {
            logWorkspaceFailure(
              this.logger,
              "delete_workspace",
              "last_workspace",
              {
                userId: access.userId,
                organizationId: access.organization.id,
                workspaceId,
              },
            );
            throw new IamWorkspaceLastInOrganizationError();
          }

          await this.workspaces.deleteWorkspace(db, workspaceId);

          this.logger.info("iam_workspace_delete_completed", {
            ...workspaceTelemetry("delete_workspace", {
              userId: access.userId,
              organizationId: access.organization.id,
              workspaceId,
            }),
            "iam.outcome": "delete_completed",
          });
        }),
    );
  }
}

function getHumanIdentity(principal: Principal): ExternalIdentityRef {
  if (principal.kind !== "human-user") {
    throw new IamUnsupportedPrincipalError();
  }

  return {
    provider: principal.credential.provider,
    subject: principal.credential.providerSubject,
  };
}

function parseWorkspaceId(workspaceId: string) {
  const parsed = workspaceIdSchema.safeParse(workspaceId);

  if (!parsed.success) {
    throw new IamWorkspaceInvalidInputError();
  }

  return parsed.data;
}

function parseWorkspaceInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new IamWorkspaceInvalidInputError();
  }

  return parsed.data;
}

function canAdministerWorkspace(role: "owner" | "admin" | "member") {
  return role === "owner" || role === "admin";
}

function normalizeDescription(value: string | null | undefined) {
  const description = value?.trim();

  return description ? description : null;
}

function toWorkspaceRecord(access: {
  role: "owner" | "admin" | "member";
  organization: { id: string; name: string };
  workspace: { id: string; name: string; description: string | null };
}): IamWorkspaceRecord {
  return {
    id: access.workspace.id,
    name: access.workspace.name,
    description: access.workspace.description,
    organization: access.organization,
    membershipRole: access.role,
  };
}

function workspaceTelemetry(
  useCase: string,
  attributes: RuntimeTelemetryAttributes = {},
): RuntimeTelemetryAttributes {
  return {
    "supagen.domain": "iam",
    "supagen.use_case": useCase,
    ...attributes,
  };
}

function logWorkspaceFailure(
  logger: RuntimeLogger,
  useCase: string,
  outcome: string,
  attributes: RuntimeTelemetryAttributes = {},
) {
  logger.warn("iam_workspace_operation_failed", {
    ...workspaceTelemetry(useCase),
    "iam.outcome": outcome,
    ...attributes,
  });
}
