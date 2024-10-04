import { z } from "zod";

import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { projectTasks } from "techme/server/db/schema";

function getProyectsTasksQueryKey(projectId: number, userId: string) {
  return "project_tasks_" + projectId + "_" + userId;
}

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
      try {
        await ctx.cache.del(getProyectsTasksQueryKey(input.projectId, user));
      } catch (error) {
        console.error("Failed to delete cache on createTask", error);
      }
      return task;
    }),
  getProjectTasks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      try {
        const tasks = await ctx.cache.get(
          getProyectsTasksQueryKey(input.projectId, user),
        );
        if (tasks) {
          return JSON.parse(tasks) as Record<
            "todo" | "in-progress" | "done",
            {
              projectId: number | null;
              id: number;
              description: string;
              userId: string | null;
              status: string;
              title: string;
              priority: number | null;
              createdAt: Date | null;
              lastModifiedBy: string | null;
            }[]
          >;
        }
      } catch (error) {
        console.error("Failed to get cache on getProjectTasks", error);
      }
      const tasks = await ctx.db
        .select()
        .from(projectTasks)
        .where(
          and(
            eq(projectTasks.projectId, input.projectId),
            eq(projectTasks.userId, user),
          ),
        );
      const tasksGrouped = {
        todo: [] as typeof tasks,
        "in-progress": [] as typeof tasks,
        done: [] as typeof tasks,
      } as Record<"todo" | "in-progress" | "done", typeof tasks>;
      for (const task of tasks) {
        tasksGrouped[task.status as "todo" | "in-progress" | "done"].push(task);
      }
      try {
        await ctx.cache.set(
          getProyectsTasksQueryKey(input.projectId, user),
          JSON.stringify(tasksGrouped),
          { EX: 60 * 60 },
        );
      } catch (error) {
        console.error("Failed to set cache on getProjectTasks", error);
      }

      return tasksGrouped;
    }),
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        projectId: z.number(),
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
      try {
        await ctx.cache.del(getProyectsTasksQueryKey(input.projectId, user));
      } catch (error) {
        console.error("Failed to delete cache on updateTaskStatus", error);
      }
      return task;
    }),
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        projectId: z.number(),
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
      try {
        await ctx.cache.del(getProyectsTasksQueryKey(input.projectId, user));
      } catch (error) {
        console.error("Failed to delete cache on updateTask", error);
      }
      return task;
    }),
});
