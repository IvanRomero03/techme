import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { projects, peoplePerProject } from "techme/server/db/schema";
import { eq } from "drizzle-orm";

export const calendaryDatesRouter = createTRPCRouter({
  getProjectDates: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user) {
      return [];
    }
    
    const projectDates = await ctx.db
      .select({
        id: projects.id,
        name: projects.name, 
        startDate: projects.startDate,
        endDate: projects.endDate,
      })
      .from(projects)
      .leftJoin(peoplePerProject, eq(projects.id, peoplePerProject.projectId))
      .where(eq(peoplePerProject.userId, user.id));

    return projectDates;
  }),
});
