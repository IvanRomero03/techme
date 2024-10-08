import { z } from "zod";

import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { users } from "techme/server/db/schema";
import { UserRole } from "techme/util/UserRole";

export const membersRouter = createTRPCRouter({
  getMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.users.findMany();
    return members;
  }),
  getAuthorizedMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.users.findMany({
      where: sql`role != ${UserRole.Unauthorized}`,
    });
    return members;
  }),
  updateUserRole: protectedProcedure
    .input(z.object({ id: z.string(), role: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id));
    }),
  getTopMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.users.findMany({
      where: sql`id != ${ctx.session.user.id}`,
      limit: 3,
    });
    return members;
  }),
});
