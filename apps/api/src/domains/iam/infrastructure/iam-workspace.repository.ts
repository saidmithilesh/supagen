import { Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";

import type { DbExecutor } from "../../../infrastructure/database";
import {
  iamExternalIdentities,
  iamMemberships,
  iamOrganizations,
  iamUsers,
  iamWorkspaces,
} from "../iam.schema";
import type { ExternalIdentityRef } from "../domain/principal";

export type IamWorkspaceAccess = {
  userId: string;
  role: "owner" | "admin" | "member";
  organization: {
    id: string;
    name: string;
  };
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
};

export type IamOrganizationAccess = {
  userId: string;
  role: "owner" | "admin" | "member";
  organization: {
    id: string;
    name: string;
  };
};

export type IamWorkspaceRecord = {
  id: string;
  name: string;
  description: string | null;
  organization: {
    id: string;
    name: string;
  };
  membershipRole: "owner" | "admin" | "member";
};

@Injectable()
export class IamWorkspaceRepository {
  async listAccessibleWorkspaces(
    db: DbExecutor,
    identity: ExternalIdentityRef,
  ): Promise<IamWorkspaceRecord[]> {
    const rows = await db
      .select({
        role: iamMemberships.role,
        organizationId: iamOrganizations.id,
        organizationName: iamOrganizations.name,
        workspaceId: iamWorkspaces.id,
        workspaceName: iamWorkspaces.name,
        workspaceDescription: iamWorkspaces.description,
      })
      .from(iamExternalIdentities)
      .innerJoin(iamUsers, eq(iamExternalIdentities.userId, iamUsers.id))
      .innerJoin(iamMemberships, eq(iamMemberships.userId, iamUsers.id))
      .innerJoin(
        iamOrganizations,
        eq(iamMemberships.organizationId, iamOrganizations.id),
      )
      .innerJoin(
        iamWorkspaces,
        eq(iamWorkspaces.organizationId, iamOrganizations.id),
      )
      .where(
        and(
          eq(iamExternalIdentities.provider, identity.provider),
          eq(iamExternalIdentities.providerSubject, identity.subject),
        ),
      )
      .orderBy(iamOrganizations.createdAt, iamWorkspaces.createdAt);

    return rows.map((row) => ({
      id: row.workspaceId,
      name: row.workspaceName,
      description: row.workspaceDescription,
      organization: {
        id: row.organizationId,
        name: row.organizationName,
      },
      membershipRole: row.role,
    }));
  }

  async findWorkspaceAccess(
    db: DbExecutor,
    identity: ExternalIdentityRef,
    workspaceId: string,
  ): Promise<IamWorkspaceAccess | null> {
    const [row] = await db
      .select({
        userId: iamUsers.id,
        role: iamMemberships.role,
        organizationId: iamOrganizations.id,
        organizationName: iamOrganizations.name,
        workspaceId: iamWorkspaces.id,
        workspaceName: iamWorkspaces.name,
        workspaceDescription: iamWorkspaces.description,
      })
      .from(iamExternalIdentities)
      .innerJoin(iamUsers, eq(iamExternalIdentities.userId, iamUsers.id))
      .innerJoin(iamMemberships, eq(iamMemberships.userId, iamUsers.id))
      .innerJoin(
        iamOrganizations,
        eq(iamMemberships.organizationId, iamOrganizations.id),
      )
      .innerJoin(
        iamWorkspaces,
        eq(iamWorkspaces.organizationId, iamOrganizations.id),
      )
      .where(
        and(
          eq(iamExternalIdentities.provider, identity.provider),
          eq(iamExternalIdentities.providerSubject, identity.subject),
          eq(iamWorkspaces.id, workspaceId),
        ),
      );

    if (!row) {
      return null;
    }

    return {
      userId: row.userId,
      role: row.role,
      organization: {
        id: row.organizationId,
        name: row.organizationName,
      },
      workspace: {
        id: row.workspaceId,
        name: row.workspaceName,
        description: row.workspaceDescription,
      },
    };
  }

  async findOrganizationAccess(
    db: DbExecutor,
    identity: ExternalIdentityRef,
    organizationId: string,
  ): Promise<IamOrganizationAccess | null> {
    const [row] = await db
      .select({
        userId: iamUsers.id,
        role: iamMemberships.role,
        organizationId: iamOrganizations.id,
        organizationName: iamOrganizations.name,
      })
      .from(iamExternalIdentities)
      .innerJoin(iamUsers, eq(iamExternalIdentities.userId, iamUsers.id))
      .innerJoin(iamMemberships, eq(iamMemberships.userId, iamUsers.id))
      .innerJoin(
        iamOrganizations,
        eq(iamMemberships.organizationId, iamOrganizations.id),
      )
      .where(
        and(
          eq(iamExternalIdentities.provider, identity.provider),
          eq(iamExternalIdentities.providerSubject, identity.subject),
          eq(iamOrganizations.id, organizationId),
        ),
      );

    if (!row) {
      return null;
    }

    return {
      userId: row.userId,
      role: row.role,
      organization: {
        id: row.organizationId,
        name: row.organizationName,
      },
    };
  }

  async createWorkspace(
    db: DbExecutor,
    input: {
      organization: { id: string; name: string };
      membershipRole: "owner" | "admin" | "member";
      name: string;
      description: string | null;
    },
  ): Promise<IamWorkspaceRecord> {
    const [workspace] = await db
      .insert(iamWorkspaces)
      .values({
        organizationId: input.organization.id,
        name: input.name,
        description: input.description,
      })
      .returning();

    if (!workspace) {
      throw new Error("Failed to create IAM workspace.");
    }

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      organization: input.organization,
      membershipRole: input.membershipRole,
    };
  }

  async updateWorkspace(
    db: DbExecutor,
    access: IamWorkspaceAccess,
    input: {
      name?: string;
      description?: string | null;
    },
  ): Promise<IamWorkspaceRecord> {
    const [workspace] = await db
      .update(iamWorkspaces)
      .set(input)
      .where(eq(iamWorkspaces.id, access.workspace.id))
      .returning();

    if (!workspace) {
      throw new Error("Failed to update IAM workspace.");
    }

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      organization: access.organization,
      membershipRole: access.role,
    };
  }

  async countOrganizationWorkspaces(db: DbExecutor, organizationId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(iamWorkspaces)
      .where(eq(iamWorkspaces.organizationId, organizationId));

    return Number(row?.count ?? 0);
  }

  async deleteWorkspace(db: DbExecutor, workspaceId: string) {
    await db.delete(iamWorkspaces).where(eq(iamWorkspaces.id, workspaceId));
  }
}
