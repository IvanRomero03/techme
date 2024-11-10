import { z } from "zod";

import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { peoplePerProject, projects, users } from "techme/server/db/schema";

export const projectsRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        project_name: z.string(),
        project_description: z.string(),
        project_category: z.string(),
        project_members: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db
        .insert(projects)
        .values({
          name: input.project_name,
          description: input.project_description,
          category: input.project_category,
          stage: "PLANNING",
          status: "ACTIVE",
        })
        .returning({
          id: projects.id,
          name: projects.name,
        });
      await ctx.db.insert(peoplePerProject).values(
        input.project_members.map((userId) => ({
          projectId: project[0]?.id,
          userId,
        })),
      );
      return project;
    }),
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user) {
      return [];
    }
    const res = await ctx.db
      .select()
      .from(projects)
      .leftJoin(peoplePerProject, eq(projects.id, peoplePerProject.projectId))
      .where(eq(peoplePerProject.userId, user.id));
    return res;
  }),
  getMyProjectsStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user) {
      return [];
    }
    const res = await ctx.db
      .select({
        id: projects.id,
        name: projects.name,
        completion_percentage: projects.completionPercentage,
      })
      .from(projects)
      .leftJoin(peoplePerProject, eq(projects.id, peoplePerProject.projectId))
      .where(eq(peoplePerProject.userId, user.id));
    return res;
  }),

  getMyProjectsDeadline: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user) {
      return [];
    }
    const res = await ctx.db
      .select({
        id: projects.id,
        name: projects.name,
        completion_percentage: projects.completionPercentage,
        days_left: sql`EXTRACT(DAY FROM AGE(end_date, NOW()))`.as("days_left"),
      })
      .from(projects)
      .leftJoin(peoplePerProject, eq(projects.id, peoplePerProject.projectId))
      .where(eq(peoplePerProject.userId, user.id));
    return res;
  }),

  getProyectInfo: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        return null;
      }
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);
      if (!project[0]) {
        return null;
      }
      const members = await ctx.db
        .select()
        .from(users)
        .leftJoin(peoplePerProject, eq(users.id, peoplePerProject.userId))
        .where(eq(peoplePerProject.projectId, input.projectId));
      return { project: project[0], members };
    }),

  updateProjectDetails: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        project_name: z.string(),
        project_description: z.string(),
        project_stage: z.string(),
        project_status: z.string(),
        project_category: z.string(),
        project_members: z.array(z.string()),
        project_percentage: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(projects)
        .set({
          name: input.project_name,
          description: input.project_description,
          stage: input.project_stage,
          status: input.project_status,
          category: input.project_category,
          completionPercentage: input.project_percentage,
        })
        .where(eq(projects.id, input.project_id));
      await ctx.db
        .delete(peoplePerProject)
        .where(eq(peoplePerProject.projectId, input.project_id));
      await ctx.db.insert(peoplePerProject).values(
        input.project_members.map((userId) => ({
          projectId: input.project_id,
          userId,
        })),
      );
    }),

  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(projects).where(eq(projects.id, input.projectId));
    }),
});
