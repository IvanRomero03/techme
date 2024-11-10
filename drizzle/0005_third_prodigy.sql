CREATE TABLE IF NOT EXISTS "techme_techme_notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_read" boolean DEFAULT false,
	"related_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "notifications";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_techme_notification" ADD CONSTRAINT "techme_techme_notification_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
