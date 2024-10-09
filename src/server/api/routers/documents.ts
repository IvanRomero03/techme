import { z } from "zod";

import { and, eq } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { estimations } from "techme/server/db/schema";
import { projectDocuments } from "techme/server/db/schema";
import { getStorage } from "techme/server/db/storage";
import { env } from "techme/env";

export const documentsRouter = createTRPCRouter({
  getDocuments: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const documents = await ctx.db
        .select()
        .from(projectDocuments)
        .where(and(eq(projectDocuments.projectId, input.projectId)));
      return documents;
    }),
  removeDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const document = await ctx.db
        .select()
        .from(projectDocuments)
        .where(and(eq(projectDocuments.id, input.documentId)));
      if (!document[0]) {
        throw new Error("Document not found");
      }
      const storage = await getStorage();
      if (!storage) {
        throw new Error("Failed to get storage");
      }
      const path = document[0].url.split("/").pop();
      if (!path) {
        throw new Error("Failed to get path");
      }
      const response = await storage.from("techme_documents").remove([path]);
      if (response.error) {
        throw new Error(response.error.message);
      }
      await ctx.db
        .delete(projectDocuments)
        .where(and(eq(projectDocuments.id, input.documentId)));
    }),
  renameDocument: protectedProcedure
    .input(z.object({ documentId: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(projectDocuments)
        .set({ name: input.name })
        .where(and(eq(projectDocuments.id, input.documentId)));
    }),
});
