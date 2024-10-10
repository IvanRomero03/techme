import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `techme_${name}`);

export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }).default("UNAUTH"),
    emailVerified: timestamp("email_verified", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
  },
  (user) => ({
    emailIdx: index("user_email_idx").on(user.email),
    nameIdx: index("user_name_idx").on(user.name),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const projects = createTable(
  "project",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 255 }).notNull(),
    completionPercentage: integer("completion_percentage").default(0),
    startDate: timestamp("start_date", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    endDate: timestamp("end_date", {
      mode: "date",
      withTimezone: true,
    }).default(sql`NOW() + INTERVAL '5 days'`),
    stage: varchar("stage", { length: 255 }).default("planning"),
    status: varchar("status", { length: 255 }).default("active"),
  },
  (project) => ({
    nameIdx: index("project_name_idx").on(project.name),
  }),
);

export const peoplePerProject = createTable("people_per_project", {
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
});

export const requirements = createTable(
  "requirements",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    title: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 255 }).default("active"),
    priority: integer("priority").default(0),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    lastModifiedBy: varchar("last_modified_by", { length: 255 }).references(
      () => users.id,
    ),
  },
  (requirement) => ({
    projectIdIdx: index("requirement_project_id_idx").on(requirement.projectId),
  }),
);

export const projectTasks = createTable(
  "project_tasks",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    title: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 255 }).default("todo").notNull(),
    priority: integer("priority").default(0),
    userId: varchar("user_id", { length: 255 }).references(() => users.id),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    lastModifiedBy: varchar("last_modified_by", { length: 255 }).references(
      () => users.id,
    ),
  },
  (task) => ({
    projectIdIdx: index("task_project_id_idx").on(task.projectId),
    projectNameIdx: index("task_project_name_idx").on(task.title),
    projectStatusIdx: index("task_project_status_idx").on(task.status),
  }),
);

export const frameworkContracts = createTable(
  "framework_contracts",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    startDate: timestamp("start_date", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    endDate: timestamp("end_date", {
      mode: "date",
      withTimezone: true,
    }).default(sql`NOW() + INTERVAL '1 year'`),
    status: varchar("status", { length: 255 }).default("active"),
    lastModifiedBy: varchar("last_modified_by", { length: 255 }).references(
      () => users.id,
    ),
  },
  (contract) => ({
    nameIdx: index("contract_name_idx").on(contract.name),
    statusIdx: index("contract_status_idx").on(contract.status),
  }),
);

export const frameworkContractPerProject = createTable(
  "framework_contract_per_project",
  {
    contractId: integer("contract_id").references(() => frameworkContracts.id, {
      onDelete: "cascade",
    }),
    projectId: integer("project_id").references(() => projects.id),
  },
);

export const estimations = createTable(
  "estimations",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    phase: varchar("phase", { length: 255 }).notNull(),
    timeEstimation: integer("time_estimation").default(0),
    timeUnit: varchar("time_unit", { length: 255 }).default("days"),
    manforce: integer("manforce").default(0),
    manforceUnit: varchar("manforce_unit", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    lastModifiedBy: varchar("last_modified_by", { length: 255 }).references(
      () => users.id,
    ),
  },
  (estimation) => ({
    projectIdIdx: index("estimation_project_id_idx").on(estimation.projectId),
    phaseIdx: index("estimation_phase_idx").on(estimation.phase),
  }),
);

export const projectDocuments = createTable(
  "documents",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    uploadedBy: varchar("uploaded_by", { length: 255 }).references(
      () => users.id,
    ),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (document) => ({
    projectIdIdx: index("document_project_id_idx").on(document.projectId),
    nameIdx: index("document_name_idx").on(document.name),
  }),
);

export const meetings = createTable("meetings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
  description: text("description"), // Adding description field
  createdBy: varchar("created_by", { length: 255 })
    .references(() => users.id)
    .notNull(),
  modifiedBy: varchar("modified_by", { length: 255 }).references(
    () => users.id,
  ),
});

export const meetingsRelations = relations(meetings, ({ many }) => ({
  attendees: many(peoplePerMeeting),
}));

export const peoplePerMeeting = createTable(
  "people_per_meeting",
  {
    meetingId: integer("meeting_id").references(() => meetings.id, {
      onDelete: "cascade",
    }), // Foreign key for meetings
    userId: varchar("user_id", { length: 255 }).references(() => users.id), // Foreign key for users
    createdBy: varchar("created_by", { length: 255 })
      .references(() => users.id)
      .notNull(), // User who invited
    modifiedBy: varchar("modified_by", { length: 255 }).references(
      () => users.id,
    ), // User who last modified the invitation
  },
  (peoplePerMeeting) => ({
    meetingIdUserIdx: primaryKey({
      columns: [peoplePerMeeting.meetingId, peoplePerMeeting.userId],
    }),
    meetingIdIdx: index("people_per_meeting_meeting_id_idx").on(
      peoplePerMeeting.meetingId,
    ),
    userIdIdx: index("people_per_meeting_user_id_idx").on(
      peoplePerMeeting.userId,
    ),
  }),
);

export const peoplePerMeetingRelations = relations(
  peoplePerMeeting,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [peoplePerMeeting.meetingId],
      references: [meetings.id],
    }),
    user: one(users, {
      fields: [peoplePerMeeting.userId],
      references: [users.id],
    }),
  }),
);

export const documentEmbeddings = createTable(
  "document_embeddings",
  {
    documentId: varchar("document_id", { length: 255 }).references(
      () => projectDocuments.id,
    ),
    text: text("text").notNull(),
    embedding: vector("embedding", { dimensions: 3072 }).notNull(), // text-embedding-3-large
  },
  (embedding) => ({
    documentIdIdx: index("embedding_document_id_idx").on(embedding.documentId),
  }),
);
