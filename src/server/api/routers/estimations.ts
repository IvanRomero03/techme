import { z } from "zod";

import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { estimations } from "techme/server/db/schema";

export const projectsEstimationsRouter = createTRPCRouter({
  createEstimation: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        phase: z.string(),
        timeEstimation: z.object({
          value: z.number(),
          unit: z.string(),
        }),
        manforce: z.object({
          value: z.number(),
          unit: z.string(),
        }),
        notes: z.string(),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const estimation = await ctx.db.insert(estimations).values({
        projectId: input.projectId,
        phase: input.phase,
        timeEstimation: input.timeEstimation.value,
        timeUnit: input.timeEstimation.unit,
        manforce: input.manforce.value,
        manforceUnit: input.manforce.unit,
        notes: input.notes,
        lastModifiedBy: user,
      });
      return estimation;
    }),
  getProjectEstimations: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const res = await ctx.db.query.estimations.findMany({
        where: eq(estimations.projectId, input.projectId),
      });
      return res;
    }),
  updateEstimation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        projectId: z.number(),
        phase: z.string(),
        timeEstimation: z.object({
          value: z.number(),
          unit: z.string(),
        }),
        manforce: z.object({
          value: z.number(),
          unit: z.string(),
        }),
        notes: z.string(),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const estimation = await ctx.db
        .update(estimations)
        .set({
          projectId: input.projectId,
          phase: input.phase,
          timeEstimation: input.timeEstimation.value,
          timeUnit: input.timeEstimation.unit,
          manforce: input.manforce.value,
          manforceUnit: input.manforce.unit,
          notes: input.notes,
          lastModifiedBy: user,
        })
        .where(eq(estimations.id, input.id));
      return estimation;
    }),

  deleteEstimation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const user = ctx.session.user.id;
      const estimation = await ctx.db
        .delete(estimations)
        .where(eq(estimations.id, input.id));
      return estimation;
    }),
});
