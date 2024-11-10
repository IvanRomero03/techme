CREATE TABLE IF NOT EXISTS "techme_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "techme_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_document_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255),
	"text" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_estimations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"phase" varchar(255) NOT NULL,
	"time_estimation" integer DEFAULT 0,
	"time_unit" varchar(255) DEFAULT 'days',
	"manforce" integer DEFAULT 0,
	"manforce_unit" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_modified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_framework_contract_per_project" (
	"contract_id" integer,
	"project_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_framework_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp with time zone DEFAULT now(),
	"end_date" timestamp with time zone DEFAULT NOW() + INTERVAL '1 year',
	"status" varchar(255) DEFAULT 'active',
	"last_modified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"description" text,
	"created_by" varchar(255) NOT NULL,
	"modified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
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
CREATE TABLE IF NOT EXISTS "techme_people_per_meeting" (
	"meeting_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"modified_by" varchar(255),
	CONSTRAINT "techme_people_per_meeting_meeting_id_user_id_pk" PRIMARY KEY("meeting_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_people_per_project" (
	"project_id" integer,
	"user_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_documents" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"project_id" integer,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(255) DEFAULT 'todo' NOT NULL,
	"priority" integer DEFAULT 0,
	"user_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"last_modified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(255) NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"start_date" timestamp with time zone DEFAULT now(),
	"end_date" timestamp with time zone DEFAULT NOW() + INTERVAL '5 days',
	"stage" varchar(255) DEFAULT 'planning',
	"status" varchar(255) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(255) DEFAULT 'active',
	"priority" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_modified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(255) DEFAULT 'UNAUTH',
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_validation" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"is_final" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_validation_document_likes" (
	"document_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"liked_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "techme_validation_document_likes_document_id_user_id_pk" PRIMARY KEY("document_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_validation_document_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"note" text NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_validation_documents" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"validation_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "techme_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "techme_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_account" ADD CONSTRAINT "techme_account_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_document_embeddings" ADD CONSTRAINT "techme_document_embeddings_document_id_techme_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."techme_documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_estimations" ADD CONSTRAINT "techme_estimations_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_estimations" ADD CONSTRAINT "techme_estimations_last_modified_by_techme_user_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_framework_contract_per_project" ADD CONSTRAINT "techme_framework_contract_per_project_contract_id_techme_framework_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."techme_framework_contracts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_framework_contract_per_project" ADD CONSTRAINT "techme_framework_contract_per_project_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_framework_contracts" ADD CONSTRAINT "techme_framework_contracts_last_modified_by_techme_user_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_meetings" ADD CONSTRAINT "techme_meetings_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_meetings" ADD CONSTRAINT "techme_meetings_created_by_techme_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_meetings" ADD CONSTRAINT "techme_meetings_modified_by_techme_user_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_meeting" ADD CONSTRAINT "techme_people_per_meeting_meeting_id_techme_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."techme_meetings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_meeting" ADD CONSTRAINT "techme_people_per_meeting_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_meeting" ADD CONSTRAINT "techme_people_per_meeting_created_by_techme_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_meeting" ADD CONSTRAINT "techme_people_per_meeting_modified_by_techme_user_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_project" ADD CONSTRAINT "techme_people_per_project_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_people_per_project" ADD CONSTRAINT "techme_people_per_project_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_documents" ADD CONSTRAINT "techme_documents_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_documents" ADD CONSTRAINT "techme_documents_uploaded_by_techme_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_project_tasks" ADD CONSTRAINT "techme_project_tasks_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_project_tasks" ADD CONSTRAINT "techme_project_tasks_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_project_tasks" ADD CONSTRAINT "techme_project_tasks_last_modified_by_techme_user_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_requirements" ADD CONSTRAINT "techme_requirements_project_id_techme_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."techme_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_requirements" ADD CONSTRAINT "techme_requirements_last_modified_by_techme_user_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_session" ADD CONSTRAINT "techme_session_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation" ADD CONSTRAINT "techme_validation_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_document_likes" ADD CONSTRAINT "techme_validation_document_likes_document_id_techme_validation_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."techme_validation_documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_document_likes" ADD CONSTRAINT "techme_validation_document_likes_user_id_techme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_document_notes" ADD CONSTRAINT "techme_validation_document_notes_document_id_techme_validation_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."techme_validation_documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_document_notes" ADD CONSTRAINT "techme_validation_document_notes_created_by_techme_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_documents" ADD CONSTRAINT "techme_validation_documents_validation_id_techme_validation_id_fk" FOREIGN KEY ("validation_id") REFERENCES "public"."techme_validation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "techme_validation_documents" ADD CONSTRAINT "techme_validation_documents_uploaded_by_techme_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."techme_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "techme_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_document_id_idx" ON "techme_document_embeddings" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimation_project_id_idx" ON "techme_estimations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimation_phase_idx" ON "techme_estimations" USING btree ("phase");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_name_idx" ON "techme_framework_contracts" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_status_idx" ON "techme_framework_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_per_meeting_meeting_id_idx" ON "techme_people_per_meeting" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_per_meeting_user_id_idx" ON "techme_people_per_meeting" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_project_id_idx" ON "techme_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_name_idx" ON "techme_documents" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_project_id_idx" ON "techme_project_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_project_name_idx" ON "techme_project_tasks" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_project_status_idx" ON "techme_project_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_name_idx" ON "techme_project" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requirement_project_id_idx" ON "techme_requirements" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "techme_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "techme_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_name_idx" ON "techme_user" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_user_id_idx" ON "techme_validation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_like_document_id_idx" ON "techme_validation_document_likes" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_like_user_id_idx" ON "techme_validation_document_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_note_document_id_idx" ON "techme_validation_document_notes" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Validation_document_validation_id_idx" ON "techme_validation_documents" USING btree ("validation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_documet_name_idx" ON "techme_validation_documents" USING btree ("name");