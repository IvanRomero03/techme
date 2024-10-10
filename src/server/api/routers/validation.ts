import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { validation, documentNotes, reviewSubmission } from "techme/server/db/schema";
import { eq, count } from "drizzle-orm";

export const validationRouter = createTRPCRouter({
  // Crear una nueva validación (review)
  createValidation: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        documentUrl: z.string(),
        notes: z.string().optional().nullable(),
        completed: z.boolean().default(false),
        lastModifiedBy: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newValidation = await ctx.db
        .insert(validation)
        .values({
          projectId: input.projectId,
          documentUrl: input.documentUrl,
          completed: input.completed ?? false,
          lastModifiedBy: input.lastModifiedBy,
        })
        .returning();

      if (!newValidation || !newValidation[0]) {
        throw new Error("Failed to create validation.");
      }

      // Si se proporcionan notas, las insertamos
      if (input.notes) {
        await ctx.db.insert(documentNotes).values({
          validationId: newValidation[0].id,
          documentUrl: input.documentUrl,
          note: input.notes,
          createdBy: input.lastModifiedBy,
        });
      }

      return newValidation;
    }),

  // Obtener todas las validaciones (reviews) por proyecto
  getAllValidations: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const allValidations = await ctx.db
        .select()
        .from(validation)
        .where(eq(validation.projectId, input.projectId));
      return allValidations;
    }),

  // Actualizar una validación
  updateValidation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        documentUrl: z.string().optional(),
        notes: z.string().optional(),
        projectId: z.number().optional(),
        completed: z.boolean().optional(),
        lastModifiedBy: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedValidation = await ctx.db
        .update(validation)
        .set({
          documentUrl: input.documentUrl ?? undefined,
          projectId: input.projectId ?? undefined,
          completed: input.completed ?? undefined,
          lastModifiedBy: input.lastModifiedBy,
        })
        .where(eq(validation.id, input.id))
        .returning();

      if (input.notes) {
        await ctx.db.insert(documentNotes).values({
          validationId: input.id,
          documentUrl: input.documentUrl ?? undefined,
          note: input.notes,
          createdBy: input.lastModifiedBy,
        });
      }

      return updatedValidation;
    }),

  // Eliminar una validación
  deleteValidation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(validation).where(eq(validation.id, input.id));
    }),

  // Subir todos los reviews con confirmación
  submitAllReviews: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Contamos todas las validaciones completadas del proyecto
      const countValidations = await ctx.db
      .select({ count: count() })  // Aseguramos que el conteo esté correctamente etiquetado como 'count'
      .from(validation)
      .where(eq(validation.projectId, input.projectId));
    
    // Si no hay validaciones, no permitimos la subida
    if (!countValidations[0] || countValidations[0].count === 0) {
      throw new Error("No hay reviews para subir.");
    }
    
    // Marcamos todos los reviews como completados
    await ctx.db
      .update(validation)
      .set({ completed: true })
      .where(eq(validation.projectId, input.projectId));
    
    // Registramos la subida en reviewSubmission
    await ctx.db
      .insert(reviewSubmission)
      .values({
        validationId: input.projectId,
        reviewCount: countValidations[0].count,
        finalReview: true,
        submittedBy: ctx.session.user.id,
      });
    
    return {
      message: `${countValidations[0].count} reviews subidos correctamente.`,
      totalReviews: countValidations[0].count,
    };    
    }),

  // Obtener el conteo de reviews creados
  getReviewCount: publicProcedure
  .input(z.object({
    projectId: z.number(),
  }))
  .query(async ({ ctx, input }) => {
    const reviewCountResult = await ctx.db
      .select({ count: count() })  // Seleccionamos el conteo con una etiqueta
      .from(validation)
      .where(eq(validation.projectId, input.projectId));

    // Aseguramos que obtenemos al menos un valor
    const reviewCount = reviewCountResult[0]?.count ?? 0;

    return {
      count: reviewCount,
    };
  }),
});
