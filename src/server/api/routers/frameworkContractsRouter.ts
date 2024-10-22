import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { frameworkContracts, frameworkContractPerProject } from "techme/server/db/schema";

export const frameworkContractsRouter = createTRPCRouter({
  
  
  getAllContracts: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(frameworkContracts)
        .leftJoin(
          frameworkContractPerProject,
          eq(frameworkContracts.id, frameworkContractPerProject.contractId)
        )
        .where(eq(frameworkContractPerProject.projectId, input.projectId));
    }),

  
  addContract: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        startDate: z.string(), 
        endDate: z.string(),
        status: z.string().default("active"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      
      const newContract = await ctx.db
        .insert(frameworkContracts)
        .values({
          name: input.name,
          description: input.description ?? null,
          startDate: new Date(input.startDate), 
          endDate: new Date(input.endDate), 
          status: input.status ?? "active",
        })
        .returning();

      
      await ctx.db.insert(frameworkContractPerProject).values({
        contractId: newContract?.[0]?.id ?? -1, 
        projectId: input.projectId,
      });

      return newContract;
    }),

  
  updateContract: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedContract = await ctx.db
        .update(frameworkContracts)
        .set({
          name: input.name ?? undefined,
          description: input.description ?? undefined,
          startDate: input.startDate ? new Date(input.startDate) : undefined, 
          endDate: input.endDate ? new Date(input.endDate) : undefined, 
          status: input.status ?? undefined,
        })
        .where(eq(frameworkContracts.id, input.id))
        .returning();

      return updatedContract;
    }),

  
  deleteContract: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      
      await ctx.db
        .delete(frameworkContractPerProject)
        .where(eq(frameworkContractPerProject.contractId, input.id));

      
      await ctx.db
        .delete(frameworkContracts)
        .where(eq(frameworkContracts.id, input.id));
    }),
});
