ALTER TABLE "approvals" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "approvals" CASCADE;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "rejected_by" integer;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "rejection_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;