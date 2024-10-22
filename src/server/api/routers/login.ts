import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "techme/server/api/trpc";
import { users } from "techme/server/db/schema";

export const loginVerification = createTRPCRouter({
    // Verify the user
    verifyUser: publicProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
            where: sql`id = ${input.username}`,
        });

        if (user) {
                console.log('User found:', user);
                
                // Return user details, to be used in the session
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email, 
                    role: user.role,
                    emailVerified: user.emailVerified,
                };
        } else {
            throw new Error("Invalid credentials");
        }
    }),
});
