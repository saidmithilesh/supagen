CREATE TYPE "public"."iam_membership_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "iam_external_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" "iam_membership_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_name" text,
	"primary_email" text,
	"avatar_url" text
);
--> statement-breakpoint
CREATE TABLE "iam_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iam_external_identities" ADD CONSTRAINT "iam_external_identities_user_id_iam_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."iam_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_memberships" ADD CONSTRAINT "iam_memberships_user_id_iam_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."iam_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_memberships" ADD CONSTRAINT "iam_memberships_organization_id_iam_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."iam_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_workspaces" ADD CONSTRAINT "iam_workspaces_organization_id_iam_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."iam_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "iam_external_identities_provider_subject_unique" ON "iam_external_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE UNIQUE INDEX "iam_memberships_user_organization_unique" ON "iam_memberships" USING btree ("user_id","organization_id");