import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "techme/server/api/trpc";
import { documentNotes, validation } from "techme/server/db/schema"; // Asegúrate de importar `validation`
import { eq } from "drizzle-orm";

export const documentNotesRouter = createTRPCRouter({
  // Obtener todas las notas de un proyecto basado en `projectId`
  getAllNotes: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const notes = await ctx.db
        .select({
          id: documentNotes.id,
          validationId: documentNotes.validationId,
          documentUrl: documentNotes.documentUrl,
          note: documentNotes.note,
          createdAt: documentNotes.createdAt,
          createdBy: documentNotes.createdBy,
        })
        .from(documentNotes)
        .innerJoin(validation, eq(documentNotes.validationId, validation.id)) // Unimos las tablas por `validationId`
        .where(eq(validation.projectId, input.projectId)); // Filtramos por `projectId` desde la tabla `validation`
      
      return notes;
    }),

  // Crear una nueva nota y documento de validación
  createDocumentAndNote: protectedProcedure
    .input(
      z.object({
        validationId: z.number(),
        documentUrl: z.string(),
        note: z.string().optional(),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newEntry = await ctx.db
        .insert(documentNotes)
        .values({
          validationId: input.validationId,
          documentUrl: input.documentUrl,
          note: input.note ?? '', // Puede que la nota sea opcional
          createdBy: input.createdBy,
        })
        .returning();
      return newEntry;
    }),

  // Actualizar una nota o un documento existente
  updateDocumentAndNote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        note: z.string().optional(),
        documentUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedEntry = await ctx.db
        .update(documentNotes)
        .set({
          note: input.note ?? undefined,
          documentUrl: input.documentUrl ?? undefined,
        })
        .where(eq(documentNotes.id, input.id))
        .returning();
      return updatedEntry;
    }),

  // Eliminar una nota y su documento
  deleteDocumentAndNote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(documentNotes).where(eq(documentNotes.id, input.id));
    }),
});
