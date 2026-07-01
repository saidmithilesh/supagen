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
import type { IamProfile } from "../domain/profile";
import type { ExternalIdentityRef } from "../domain/principal";

export type CreateBootstrapGraphInput = {
  identity: ExternalIdentityRef;
  user: {
    displayName: string | null;
    primaryEmail: string | null;
    avatarUrl: string | null;
  };
  organization: {
    name: string;
  };
  workspace: {
    name: string;
  };
};

@Injectable()
export class IamProfileRepository {
  async lockBootstrapIdentity(db: DbExecutor, identity: ExternalIdentityRef) {
    await db.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${identity.provider}:${identity.subject}`}, 0))`,
    );
  }

  async findProfileByExternalIdentity(
    db: DbExecutor,
    identity: ExternalIdentityRef,
  ): Promise<IamProfile | null> {
    const rows = await db
      .select({
        userId: iamUsers.id,
        displayName: iamUsers.displayName,
        primaryEmail: iamUsers.primaryEmail,
        avatarUrl: iamUsers.avatarUrl,
        role: iamMemberships.role,
        organizationId: iamOrganizations.id,
        organizationName: iamOrganizations.name,
        workspaceId: iamWorkspaces.id,
        workspaceName: iamWorkspaces.name,
        workspaceDescription: iamWorkspaces.description,
      })
      .from(iamExternalIdentities)
      .innerJoin(iamUsers, eq(iamExternalIdentities.userId, iamUsers.id))
      .leftJoin(iamMemberships, eq(iamMemberships.userId, iamUsers.id))
      .leftJoin(
        iamOrganizations,
        eq(iamMemberships.organizationId, iamOrganizations.id),
      )
      .leftJoin(
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

    if (rows.length === 0) {
      return null;
    }

    const [first] = rows;

    if (!first) {
      return null;
    }

    const membershipsByOrganization = new Map<
      string,
      IamProfile["memberships"][number]
    >();

    for (const row of rows) {
      if (!row.role || !row.organizationId || !row.organizationName) {
        continue;
      }

      const existing = membershipsByOrganization.get(row.organizationId);
      const membership =
        existing ??
        ({
          role: row.role,
          organization: {
            id: row.organizationId,
            name: row.organizationName,
          },
          workspaces: [],
        } satisfies IamProfile["memberships"][number]);

      if (row.workspaceId && row.workspaceName) {
        membership.workspaces.push({
          id: row.workspaceId,
          name: row.workspaceName,
          description: row.workspaceDescription,
        });
      }

      membershipsByOrganization.set(row.organizationId, membership);
    }

    return {
      user: {
        id: first.userId,
        displayName: first.displayName,
        primaryEmail: first.primaryEmail,
        avatarUrl: first.avatarUrl,
      },
      memberships: Array.from(membershipsByOrganization.values()),
    };
  }

  isCompleteProfile(profile: IamProfile) {
    return (
      profile.memberships.length > 0 &&
      profile.memberships.every(
        (membership) => membership.workspaces.length > 0,
      )
    );
  }

  async createBootstrapGraph(db: DbExecutor, input: CreateBootstrapGraphInput) {
    const [user] = await db
      .insert(iamUsers)
      .values({
        displayName: input.user.displayName,
        primaryEmail: input.user.primaryEmail,
        avatarUrl: input.user.avatarUrl,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create IAM user.");
    }

    await db.insert(iamExternalIdentities).values({
      userId: user.id,
      provider: input.identity.provider,
      providerSubject: input.identity.subject,
    });

    await this.createOrganizationWorkspaceAndMembership(db, {
      userId: user.id,
      organizationName: input.organization.name,
      workspaceName: input.workspace.name,
    });
  }

  async repairBootstrapGraph(
    db: DbExecutor,
    profile: IamProfile,
    input: Pick<CreateBootstrapGraphInput, "organization" | "workspace">,
  ) {
    if (profile.memberships.length === 0) {
      await this.createOrganizationWorkspaceAndMembership(db, {
        userId: profile.user.id,
        organizationName: input.organization.name,
        workspaceName: input.workspace.name,
      });

      return;
    }

    for (const membership of profile.memberships) {
      if (membership.workspaces.length > 0) {
        continue;
      }

      await db.insert(iamWorkspaces).values({
        organizationId: membership.organization.id,
        name: input.workspace.name,
      });
    }
  }

  private async createOrganizationWorkspaceAndMembership(
    db: DbExecutor,
    input: {
      userId: string;
      organizationName: string;
      workspaceName: string;
    },
  ) {
    const [organization] = await db
      .insert(iamOrganizations)
      .values({ name: input.organizationName })
      .returning();

    if (!organization) {
      throw new Error("Failed to create IAM organization.");
    }

    await db.insert(iamWorkspaces).values({
      organizationId: organization.id,
      name: input.workspaceName,
    });

    await db.insert(iamMemberships).values({
      userId: input.userId,
      organizationId: organization.id,
      role: "owner",
    });
  }
}
