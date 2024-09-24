import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { users } from "techme/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const membersRouter = createTRPCRouter({
  getMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.users.findMany();
    return members;
  }),
  updateUserRole: protectedProcedure
    .input(z.object({ id: z.string(), role: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id));
    }),
});
