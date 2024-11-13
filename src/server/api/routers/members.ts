import { z } from "zod";

import { and, eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { invitations, users } from "techme/server/db/schema";
import { readableRole, UserRole } from "techme/util/UserRole";
import { sendEmailInvitation } from "techme/server/smtp/protocol";

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
  inviteMembers: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(UserRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db.insert(invitations).values({
        email: input.email,
        role: input.role,
        used: false,
      });
      try {
        const invitation = await sendEmailInvitation(
          input.email,
          input.name,
          readableRole(input.role),
        );
        return { success: true };
      } catch (error) {
        const deleted = await ctx.db
          .delete(invitations)
          .where(
            and(
              eq(invitations.email, input.email),
              eq(invitations.role, input.role),
            ),
          );
        return { success: false };
      }
    }),
});
