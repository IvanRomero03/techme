ALTER TABLE "techme_project_tasks" ADD COLUMN "assigned_to" varchar(255);--> statement-breakpoint
ALTER TABLE "techme_project_tasks" ADD COLUMN "due_date" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_project_tasks" ADD CONSTRAINT "techme_project_tasks_assigned_to_techme_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_assigned_to_idx" ON "techme_project_tasks" USING btree ("assigned_to");