import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { sql } from "drizzle-orm";

import { configureApp } from "../../configure-app";
import { AppModule } from "../../app.module";
import {
  DRIZZLE_DB,
  type DrizzleDatabase,
} from "../../infrastructure/database";
import type { CredentialVerifier } from "./application/credential-verifier";
import { IamIdentityProviderUnavailableError } from "./application/iam.errors";
import type {
  IdentityProvider,
  IdentityProviderUser,
} from "./application/identity-provider";
import type { Principal } from "./domain/principal";
import {
  IAM_CREDENTIAL_VERIFIER,
  IAM_IDENTITY_PROVIDER,
} from "./iam.constants";

describe("IAM profile API", () => {
  let app: INestApplication;
  let db: DrizzleDatabase;

  const principals = new Map<string, Principal>();
  const providerUsers = new Map<string, IdentityProviderUser>();

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
    async getUser(identity) {
      const user = providerUsers.get(identityKey(identity));

      if (!user) {
        throw new IamIdentityProviderUnavailableError();
      }

      return user;
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
    providerUsers.clear();

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

  it("rejects unauthenticated profile requests", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/iam/profile")
      .expect(401)
      .expect({ code: "IAM_UNAUTHENTICATED" });
  });

  it("reports an authenticated profile that has not been bootstrapped", async () => {
    addPrincipal("valid-token", "user_123");

    await request(app.getHttpServer())
      .get("/api/v1/iam/profile")
      .set("Authorization", "Bearer valid-token")
      .expect(404)
      .expect({ code: "IAM_PROFILE_NOT_BOOTSTRAPPED" });
  });

  it("bootstraps the authenticated user's profile graph", async () => {
    addPrincipal("valid-token", "user_123");
    addProviderUser({
      provider: "clerk",
      subject: "user_123",
      firstName: "Mithilesh",
      lastName: "Said",
      username: "mithilesh",
      primaryEmail: "mithilesh@example.com",
      avatarUrl: "https://example.com/avatar.png",
    });

    const bootstrapResponse = await request(app.getHttpServer())
      .post("/api/v1/iam/profile/bootstrap")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(bootstrapResponse.body).toMatchObject({
      user: {
        displayName: "Mithilesh Said",
        primaryEmail: "mithilesh@example.com",
        avatarUrl: "https://example.com/avatar.png",
      },
      memberships: [
        {
          role: "owner",
          organization: {
            name: "Mithilesh's Organization",
          },
          workspaces: [
            {
              name: "Mithilesh's Workspace",
            },
          ],
        },
      ],
    });
    expect(bootstrapResponse.body.user.id).toEqual(expect.any(String));
    expect(bootstrapResponse.body.memberships[0].organization.id).toEqual(
      expect.any(String),
    );
    expect(bootstrapResponse.body.memberships[0].workspaces[0].id).toEqual(
      expect.any(String),
    );

    const profileResponse = await request(app.getHttpServer())
      .get("/api/v1/iam/profile")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(profileResponse.body).toEqual(bootstrapResponse.body);
  });

  it("keeps bootstrap idempotent for repeated calls", async () => {
    addPrincipal("valid-token", "user_123");
    addProviderUser({
      provider: "clerk",
      subject: "user_123",
      firstName: "Mithilesh",
      lastName: "Said",
      username: "mithilesh",
      primaryEmail: "mithilesh@example.com",
      avatarUrl: null,
    });

    const first = await request(app.getHttpServer())
      .post("/api/v1/iam/profile/bootstrap")
      .set("Authorization", "Bearer valid-token")
      .expect(200);
    const second = await request(app.getHttpServer())
      .post("/api/v1/iam/profile/bootstrap")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(second.body).toEqual(first.body);
  });

  it("keeps concurrent bootstrap calls on one complete profile graph", async () => {
    addPrincipal("valid-token", "user_123");
    addProviderUser({
      provider: "clerk",
      subject: "user_123",
      firstName: "Mithilesh",
      lastName: "Said",
      username: "mithilesh",
      primaryEmail: "mithilesh@example.com",
      avatarUrl: null,
    });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post("/api/v1/iam/profile/bootstrap")
          .set("Authorization", "Bearer valid-token")
          .expect(200),
      ),
    );

    const [first] = responses;

    expect(first).toBeDefined();

    for (const response of responses) {
      expect(response.body).toEqual(first!.body);
    }
  });

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

  function addProviderUser(user: IdentityProviderUser) {
    providerUsers.set(identityKey(user), user);
  }

  function identityKey(identity: { provider: string; subject: string }) {
    return `${identity.provider}:${identity.subject}`;
  }
});
