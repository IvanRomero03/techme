import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { users, projects, peoplePerProject } from "techme/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getBinaryMetadata } from "next/dist/build/swc";

/**
 * project_name: string;
    project_description: string;
    project_category: string;
    project_members: string[];
    _selectedMembers: Map<string, {
        id: string;
        name: string | null;
        email: string;
        role: string | null;
        emailVerified: Date | null;
        image: string | null;
    }>;
 */

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
        .returning();
      await ctx.db.insert(peoplePerProject).values(
        input.project_members.map((userId) => ({
          projectId: project[0]?.id,
          userId,
        })),
      );
      // .values({
      //   projectId: project[0]?.id,
      //   userId: input.project_members[0],
      // });
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
});
