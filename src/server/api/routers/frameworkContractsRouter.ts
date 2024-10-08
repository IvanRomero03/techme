import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { frameworkContracts, frameworkContractPerProject } from "techme/server/db/schema"; 


export const frameworkContractsRouter = createTRPCRouter({
  getAllContracts: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      
      return await ctx.db.select().from(frameworkContracts)
        .where(eq(frameworkContractPerProject.projectId, input.projectId)) // Obtain contracts filter
        .leftJoin(frameworkContractPerProject, eq(frameworkContracts.id, frameworkContractPerProject.contractId));
    }),


    // Should i add other mutations or functions ivan?? 

  
});



