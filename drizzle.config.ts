import { type Config } from "drizzle-kit";

import { env } from "techme/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
    database: "postgres",
    port: 5432,
    user: "postgres.egzfmwstzbapteywkqqq",
    host: "aws-0-us-west-1.pooler.supabase.com",
    password: env.DATABASE_PW,
  },
  tablesFilter: ["techme_*"],
} satisfies Config;
