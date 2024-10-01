import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { requirements } from "techme/server/db/schema";
import { eq } from "drizzle-orm";

export const requirementsRouter = createTRPCRouter({
  createRequirement: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string().optional().nullable(),
        status: z.string().default("active"),
        priority: z.number().default(0),
        lastModifiedBy: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const requirement = await ctx.db
        .insert(requirements)
        .values({
          projectId: input.projectId,
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? "active",
          priority: input.priority ?? 0,
          lastModifiedBy: input.lastModifiedBy,
        })
        .returning();
      return requirement;
    }),

  getAllRequirements: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const allRequirements = await ctx.db
        .select()
        .from(requirements)
        .where(eq(requirements.projectId, input.projectId));
      return allRequirements;
    }),

  updateRequirement: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        projectId: z.number().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.number().optional(),
        lastModifiedBy: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedRequirement = await ctx.db
        .update(requirements)
        .set({
          title: input.title ?? undefined,
          projectId: input.projectId ?? undefined,
          description: input.description ?? undefined,
          status: input.status ?? undefined,
          priority: input.priority ?? undefined,
          lastModifiedBy: input.lastModifiedBy,
        })
        .where(eq(requirements.id, input.id))
        .returning();
      return updatedRequirement;
    }),

  deleteRequirement: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(requirements).where(eq(requirements.id, input.id));
    }),
});
