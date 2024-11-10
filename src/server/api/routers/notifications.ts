import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { notifications } from "../../db/schema";
import { eq } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.notifications.findMany({
      where: eq(notifications.userId, ctx.session.user.id),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
    }),

  createMany: protectedProcedure
    .input(z.array(z.object({
      userId: z.string(),
      title: z.string(),
      message: z.string(),
      type: z.enum(['PROJECT_CREATED', 'MEETING_SCHEDULED', 'DOCUMENT_VALIDATED', 'PROJECT_ADDED']),
      relatedId: z.number().optional(),
    })))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(notifications).values(input);
    }),
});
