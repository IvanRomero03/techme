ALTER TABLE "techme_project_tasks" RENAME COLUMN "created_by" TO "user_id";--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP CONSTRAINT "techme_project_tasks_assigned_to_techme_user_id_fk";
--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP CONSTRAINT "techme_project_tasks_created_by_techme_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "task_assigned_to_idx";--> statement-breakpoint
ALTER TABLE "techme_project_tasks" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_project_tasks" ADD CONSTRAINT "techme_project_tasks_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP COLUMN IF EXISTS "assigned_to";--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP COLUMN IF EXISTS "due_date";