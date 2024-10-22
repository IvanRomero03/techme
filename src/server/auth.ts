// auth.ts or similar file
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { db } from "techme/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "techme/server/db/schema";
import type { UserRole } from "techme/util/UserRole";

/**
 * Module augmentation for `next-auth` types
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

// Create a constant for the hardcoded user data
const HARDCODED_USER = {
  id: "342e41c4-6ed3-48b4-aa74-6fae060bca5a",
  name: "Ivan Alberto Romero Wells",
  email: "a00833623@tec.mx",
  role: "ADMIN" as UserRole,
  image: null, 
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session }) => {
      
      if (process.env.NEXT_PUBLIC_USE_HARDCODED_SESSION === "true") {
        return {
          ...session,
          user: HARDCODED_USER,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
        };
      }
      
      return session;
    },
    jwt: async ({ token, user }) => {
      // If using hardcoded session, modify the JWT token
      if (process.env.NEXT_PUBLIC_USE_HARDCODED_SESSION === "true") {
        return {
          ...token,
          ...HARDCODED_USER,
        };
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};

// Wrapper for getServerSession
export const getServerAuthSession = () => getServerSession(authOptions);

// Add a helper function to check if using hardcoded session
export const isUsingHardcodedSession = () => 
  process.env.NEXT_PUBLIC_USE_HARDCODED_SESSION === "true";