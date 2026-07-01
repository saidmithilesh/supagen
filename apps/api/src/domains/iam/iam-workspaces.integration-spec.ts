import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { sql } from "drizzle-orm";

import { AppModule } from "../../app.module";
import { configureApp } from "../../configure-app";
import {
  DRIZZLE_DB,
  type DrizzleDatabase,
} from "../../infrastructure/database";
import type { CredentialVerifier } from "./application/credential-verifier";
import type { IdentityProvider } from "./application/identity-provider";
import type { Principal } from "./domain/principal";
import {
  IAM_CREDENTIAL_VERIFIER,
  IAM_IDENTITY_PROVIDER,
} from "./iam.constants";
import {
  iamExternalIdentities,
  iamMemberships,
  iamOrganizations,
  iamUsers,
  iamWorkspaces,
} from "./iam.schema";

describe("IAM workspace API", () => {
  let app: INestApplication;
  let db: DrizzleDatabase;

  const principals = new Map<string, Principal>();
  const credentialVerifier: CredentialVerifier = {
    async verifyBearerToken(token) {
      const principal = principals.get(token);

      if (!principal) {
        throw new Error("Invalid test token.");
      }

      return principal;
    },
  };
  const identityProvider: IdentityProvider = {
    async getUser() {
      throw new Error("Identity provider should not be called.");
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IAM_CREDENTIAL_VERIFIER)
      .useValue(credentialVerifier)
      .overrideProvider(IAM_IDENTITY_PROVIDER)
      .useValue(identityProvider)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    db = moduleRef.get(DRIZZLE_DB);
    await app.init();
  });

  beforeEach(async () => {
    principals.clear();

    await db.execute(sql`
      truncate table
        iam_external_identities,
        iam_memberships,
        iam_workspaces,
        iam_organizations,
        iam_users
      cascade
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects unauthenticated workspace requests", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/iam/workspaces")
      .expect(401)
      .expect({ code: "IAM_UNAUTHENTICATED" });
  });

  it("lets organization owners create, read, update, and delete workspaces", async () => {
    const graph = await seedWorkspaceGraph({
      token: "owner-token",
      subject: "owner_123",
      role: "owner",
      workspaceNames: ["Primary", "Secondary"],
    });

    const createResponse = await request(app.getHttpServer())
      .post("/api/v1/iam/workspaces")
      .set("Authorization", "Bearer owner-token")
      .send({
        organizationId: graph.organization.id,
        name: "  Growth Lab  ",
        description: "",
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: "Growth Lab",
      description: null,
      organization: {
        id: graph.organization.id,
        name: graph.organization.name,
      },
      membershipRole: "owner",
    });

    const workspaceId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/v1/iam/workspaces/${workspaceId}`)
      .set("Authorization", "Bearer owner-token")
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: workspaceId,
          name: "Growth Lab",
          description: null,
        });
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/iam/workspaces/${workspaceId}`)
      .set("Authorization", "Bearer owner-token")
      .send({
        name: "Renamed Lab",
        description: "A focused workspace.",
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: workspaceId,
          name: "Renamed Lab",
          description: "A focused workspace.",
        });
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/iam/workspaces/${workspaceId}`)
      .set("Authorization", "Bearer owner-token")
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/v1/iam/workspaces/${workspaceId}`)
      .set("Authorization", "Bearer owner-token")
      .expect(404)
      .expect({ code: "IAM_WORKSPACE_NOT_FOUND" });
  });

  it("lets organization admins create and update workspaces but not delete them", async () => {
    const graph = await seedWorkspaceGraph({
      token: "admin-token",
      subject: "admin_123",
      role: "admin",
      workspaceNames: ["Admin Primary"],
    });

    const createResponse = await request(app.getHttpServer())
      .post("/api/v1/iam/workspaces")
      .set("Authorization", "Bearer admin-token")
      .send({
        organizationId: graph.organization.id,
        name: "Admin Created",
        description: "Visible to admins.",
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: "Admin Created",
      description: "Visible to admins.",
      membershipRole: "admin",
    });

    await request(app.getHttpServer())
      .patch(`/api/v1/iam/workspaces/${graph.workspaces[0]!.id}`)
      .set("Authorization", "Bearer admin-token")
      .send({ name: "Admin Updated" })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          name: "Admin Updated",
          membershipRole: "admin",
        });
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/iam/workspaces/${graph.workspaces[0]!.id}`)
      .set("Authorization", "Bearer admin-token")
      .expect(403)
      .expect({ code: "IAM_WORKSPACE_FORBIDDEN" });
  });

  it("blocks members from creating, updating, or deleting workspaces", async () => {
    const graph = await seedWorkspaceGraph({
      token: "member-token",
      subject: "member_123",
      role: "member",
      workspaceNames: ["Member Primary"],
    });

    await request(app.getHttpServer())
      .post("/api/v1/iam/workspaces")
      .set("Authorization", "Bearer member-token")
      .send({
        organizationId: graph.organization.id,
        name: "Blocked",
      })
      .expect(403)
      .expect({ code: "IAM_WORKSPACE_FORBIDDEN" });

    await request(app.getHttpServer())
      .patch(`/api/v1/iam/workspaces/${graph.workspaces[0]!.id}`)
      .set("Authorization", "Bearer member-token")
      .send({ name: "Blocked" })
      .expect(403)
      .expect({ code: "IAM_WORKSPACE_FORBIDDEN" });

    await request(app.getHttpServer())
      .delete(`/api/v1/iam/workspaces/${graph.workspaces[0]!.id}`)
      .set("Authorization", "Bearer member-token")
      .expect(403)
      .expect({ code: "IAM_WORKSPACE_FORBIDDEN" });
  });

  it("rejects deleting the final workspace in an organization", async () => {
    const graph = await seedWorkspaceGraph({
      token: "owner-token",
      subject: "owner_123",
      role: "owner",
      workspaceNames: ["Only Workspace"],
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/iam/workspaces/${graph.workspaces[0]!.id}`)
      .set("Authorization", "Bearer owner-token")
      .expect(409)
      .expect({ code: "IAM_WORKSPACE_LAST_IN_ORGANIZATION" });
  });

  it("lists only workspaces accessible to the authenticated user", async () => {
    const first = await seedWorkspaceGraph({
      token: "first-token",
      subject: "first_123",
      role: "owner",
      workspaceNames: ["First Workspace"],
    });
    await seedWorkspaceGraph({
      token: "second-token",
      subject: "second_123",
      role: "owner",
      workspaceNames: ["Second Workspace"],
    });

    await request(app.getHttpServer())
      .get("/api/v1/iam/workspaces")
      .set("Authorization", "Bearer first-token")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([
          expect.objectContaining({
            id: first.workspaces[0]!.id,
            name: "First Workspace",
            membershipRole: "owner",
          }),
        ]);
      });
  });

  async function seedWorkspaceGraph(input: {
    token: string;
    subject: string;
    role: "owner" | "admin" | "member";
    workspaceNames: string[];
  }) {
    addPrincipal(input.token, input.subject);

    const [user] = await db
      .insert(iamUsers)
      .values({
        displayName: input.subject,
        primaryEmail: `${input.subject}@example.com`,
        avatarUrl: null,
      })
      .returning();

    const [organization] = await db
      .insert(iamOrganizations)
      .values({ name: `${input.subject} Organization` })
      .returning();

    if (!user || !organization) {
      throw new Error("Failed to seed IAM workspace graph.");
    }

    await db.insert(iamExternalIdentities).values({
      userId: user.id,
      provider: "clerk",
      providerSubject: input.subject,
    });
    await db.insert(iamMemberships).values({
      userId: user.id,
      organizationId: organization.id,
      role: input.role,
    });

    const workspaces = await db
      .insert(iamWorkspaces)
      .values(
        input.workspaceNames.map((name) => ({
          organizationId: organization.id,
          name,
          description: null,
        })),
      )
      .returning();

    return {
      user,
      organization,
      workspaces,
    };
  }

  function addPrincipal(token: string, subject: string) {
    principals.set(token, {
      kind: "human-user",
      credential: {
        type: "clerk-session",
        provider: "clerk",
        providerSubject: subject,
        sessionId: "sess_test",
      },
      actor: {
        type: "human-user",
        externalIdentity: {
          provider: "clerk",
          subject,
        },
      },
      scopes: [],
    });
  }
});
