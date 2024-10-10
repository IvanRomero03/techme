import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "techme/server/api/trpc";
import { reviewSubmission } from "techme/server/db/schema"; // Importa la tabla correcta
import { eq } from "drizzle-orm";

export const reviewSubmissionRouter = createTRPCRouter({
  // Obtener todas las submissions
  getAllSubmissions: publicProcedure
    .input(z.object({ validationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const allSubmissions = await ctx.db
        .select()
        .from(reviewSubmission)
        .where(eq(reviewSubmission.validationId, input.validationId));

      return allSubmissions;
    }),

  // Crear una nueva submission
  createSubmission: protectedProcedure
    .input(
      z.object({
        validationId: z.number(),
        reviewCount: z.number(),
        finalReview: z.boolean().default(false),
        submittedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newSubmission = await ctx.db
        .insert(reviewSubmission)
        .values({
          validationId: input.validationId,
          reviewCount: input.reviewCount,
          finalReview: input.finalReview,
          submittedBy: input.submittedBy,
        })
        .returning();
        
      return newSubmission;
    }),

  // Actualizar una submission existente
  updateSubmission: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reviewCount: z.number().optional(),
        finalReview: z.boolean().optional(),
        submittedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedSubmission = await ctx.db
        .update(reviewSubmission)
        .set({
          reviewCount: input.reviewCount ?? undefined,
          finalReview: input.finalReview ?? undefined,
          submittedBy: input.submittedBy,
        })
        .where(eq(reviewSubmission.id, input.id))
        .returning();

      return updatedSubmission;
    }),

  // Eliminar una submission
  deleteSubmission: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(reviewSubmission).where(eq(reviewSubmission.id, input.id));
    }),

  // Mutación para subir todos los reviews
  submitAllReviews: protectedProcedure
    .input(z.object({ validationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Lógica para manejar la subida de todos los reviews
      await ctx.db
        .update(reviewSubmission)
        .set({ finalReview: true }) // Marca todos los reviews como finalizados
        .where(eq(reviewSubmission.validationId, input.validationId));
      return { success: true };
    }),
});
