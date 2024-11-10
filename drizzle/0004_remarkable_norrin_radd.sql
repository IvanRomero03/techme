ALTER TABLE "techme_project_tasks" DROP CONSTRAINT "techme_project_tasks_assigned_to_techme_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "task_assigned_to_idx";--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP COLUMN IF EXISTS "assigned_to";--> statement-breakpoint
ALTER TABLE "techme_project_tasks" DROP COLUMN IF EXISTS "due_date";