ALTER TABLE "requests" DROP CONSTRAINT "requests_approved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "requests" DROP CONSTRAINT "requests_rejected_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "approver_id" integer;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "update_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "approved_by";--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "rejected_by";--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "rejection_reason";