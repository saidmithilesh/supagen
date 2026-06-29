import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { baseModelColumns } from "../../infrastructure/database/schema-helpers";

export const iamMembershipRole = pgEnum("iam_membership_role", [
  "owner",
  "admin",
  "member",
]);

export const iamUsers = pgTable("iam_users", {
  ...baseModelColumns(),
  displayName: text("display_name"),
  primaryEmail: text("primary_email"),
  avatarUrl: text("avatar_url"),
});

export const iamExternalIdentities = pgTable(
  "iam_external_identities",
  {
    ...baseModelColumns(),
    userId: uuid("user_id")
      .notNull()
      .references(() => iamUsers.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
  },
  (table) => [
    uniqueIndex("iam_external_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
  ],
);

export const iamOrganizations = pgTable("iam_organizations", {
  ...baseModelColumns(),
  name: text("name").notNull(),
});

export const iamWorkspaces = pgTable("iam_workspaces", {
  ...baseModelColumns(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => iamOrganizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const iamMemberships = pgTable(
  "iam_memberships",
  {
    ...baseModelColumns(),
    userId: uuid("user_id")
      .notNull()
      .references(() => iamUsers.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => iamOrganizations.id, { onDelete: "cascade" }),
    role: iamMembershipRole("role").notNull(),
  },
  (table) => [
    uniqueIndex("iam_memberships_user_organization_unique").on(
      table.userId,
      table.organizationId,
    ),
  ],
);

export const iamUsersRelations = relations(iamUsers, ({ many }) => ({
  externalIdentities: many(iamExternalIdentities),
  memberships: many(iamMemberships),
}));

export const iamExternalIdentitiesRelations = relations(
  iamExternalIdentities,
  ({ one }) => ({
    user: one(iamUsers, {
      fields: [iamExternalIdentities.userId],
      references: [iamUsers.id],
    }),
  }),
);

export const iamOrganizationsRelations = relations(
  iamOrganizations,
  ({ many }) => ({
    memberships: many(iamMemberships),
    workspaces: many(iamWorkspaces),
  }),
);

export const iamWorkspacesRelations = relations(iamWorkspaces, ({ one }) => ({
  organization: one(iamOrganizations, {
    fields: [iamWorkspaces.organizationId],
    references: [iamOrganizations.id],
  }),
}));

export const iamMembershipsRelations = relations(iamMemberships, ({ one }) => ({
  user: one(iamUsers, {
    fields: [iamMemberships.userId],
    references: [iamUsers.id],
  }),
  organization: one(iamOrganizations, {
    fields: [iamMemberships.organizationId],
    references: [iamOrganizations.id],
  }),
}));
