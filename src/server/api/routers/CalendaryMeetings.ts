import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { meetings, projects } from "techme/server/db/schema";  
import { eq } from "drizzle-orm";

export const CalendaryMeetingsRouter = createTRPCRouter({
  getMeetings: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user) {
      return [];
    }

    const userMeetings = await ctx.db
      .select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        projectId: meetings.projectId,
        description: meetings.description,
      })
      .from(meetings)
      .where(eq(meetings.createdBy, user.id));  

    return userMeetings;
  }),
});
