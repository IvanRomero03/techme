import { z } from "zod";

import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
// import getOpenAI from "techme/server/chatgpt/openai";
import { projects, projectTasks } from "techme/server/db/schema";
import { readableRole } from "techme/util/UserRole";

export const projectsRouterTasks = createTRPCRouter({
  createTask: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string(),
        status: z.enum(["todo", "in-progress", "done"]),
        priority: z.number().int().min(0).max(10),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const task = await ctx.db.insert(projectTasks).values({
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        userId: user,
        lastModifiedBy: user,
      });
      return task;
    }),
  getProjectTasks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const tasks = await ctx.db
        .select()
        .from(projectTasks)
        .where(
          and(
            eq(projectTasks.projectId, input.projectId),
            eq(projectTasks.userId, user),
          ),
        );
      // group by status
      const tasksGrouped = {
        todo: [] as typeof tasks,
        "in-progress": [] as typeof tasks,
        done: [] as typeof tasks,
      } as Record<"todo" | "in-progress" | "done", typeof tasks>;
      for (const task of tasks) {
        tasksGrouped[task.status as "todo" | "in-progress" | "done"].push(task);
      }
      return tasksGrouped;
    }),
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["todo", "in-progress", "done"]),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const task = await ctx.db
        .update(projectTasks)
        .set({ status: input.status, lastModifiedBy: user })
        .where(
          and(eq(projectTasks.id, input.id), eq(projectTasks.userId, user)),
        );
      return task;
    }),
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
        status: z.enum(["todo", "in-progress", "done"]),
        priority: z.number().int().min(0).max(10),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const task = await ctx.db
        .update(projectTasks)
        .set({
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          lastModifiedBy: user,
        })
        .where(
          and(eq(projectTasks.id, input.id), eq(projectTasks.userId, user)),
        );
      return task;
    }),
});
