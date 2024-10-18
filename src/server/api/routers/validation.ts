import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { validation, validationDocuments, validationDocumentNotes, validationDocumentLikes } from "techme/server/db/schema";
import { eq, sql } from "drizzle-orm";  // Asegúrate de importar sql

export const validationRouter = createTRPCRouter({
  createReview: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
        documents: z.array(z.object({
          name: z.string(),
          url: z.string(),
          uploadedBy: z.string(),
          notes: z.string().optional(),
        })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Crear el review en la tabla validation
      const review = await ctx.db
        .insert(validation)
        .values({
          name: input.name,
          userId: input.userId,
          isFinal: false,
        })
        .returning({ id: validation.id }); // Retorna solo el ID del review

      const reviewId = review[0]?.id;

      if (!reviewId) {
        throw new Error("Error creating review, reviewId is undefined.");
      }

      // Insertar los documentos asociados al review
      const documentPromises = input.documents.map(async (doc) => {
        const insertedDoc = await ctx.db.insert(validationDocuments).values({
          validationId: reviewId,
          name: doc.name,
          url: doc.url,
          uploadedBy: doc.uploadedBy,
        }).returning({ id: validationDocuments.id });

        const documentId = insertedDoc[0]?.id;

        if (!documentId) {
          throw new Error("Error inserting document, documentId is undefined.");
        }

        // Insertar notas para los documentos si están presentes
        if (doc.notes) {
          await ctx.db.insert(validationDocumentNotes).values({
            documentId: documentId,
            note: doc.notes,
            createdBy: input.userId,
          });
        }
      });

      try {
        await Promise.all(documentPromises);
      } catch (error) {
        // Verificación de tipo para asegurar que 'error' es una instancia de 'Error'
        if (error instanceof Error) {
          throw new Error("Error inserting documents: " + error.message);
        } else {
          throw new Error("Unknown error inserting documents");
        }
      }

      return review; // Devuelve el review creado
    }),

  getAllReviews: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const allReviews = await ctx.db
        .select({
          id: validation.id,
          name: validation.name,
          userId: validation.userId,
          createdAt: validation.createdAt,
          isFinal: validation.isFinal,
          completedAt: validation.completedAt,
          documents: sql`COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL), '[]')`.as("documents"),
        })
        .from(validation)
        .leftJoin(validationDocuments, eq(validationDocuments.validationId, validation.id))
        .where(eq(validation.userId, input.userId))
        .groupBy(validation.id);
    
      return allReviews;
    }),

  // Mutación para finalizar un review
  finalizeReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Actualizar el review para marcarlo como finalizado
      const finalizedReview = await ctx.db
        .update(validation)
        .set({
          isFinal: true,
          completedAt: new Date(),
        })
        .where(eq(validation.id, input.reviewId))
        .returning({ id: validation.id }); // Retorna solo el ID del review finalizado

      if (!finalizedReview[0]?.id) {
        throw new Error("Error finalizing review, reviewId is undefined.");
      }

      return finalizedReview[0]; // Retorna el review finalizado
    }),

  // Mutación para actualizar un review
  updateReview: protectedProcedure
    .input(
      z.object({
        id: z.number(),  // ID del review que quieres actualizar
        name: z.string().optional(),  // El nombre puede ser opcional si no se quiere actualizar
        userId: z.string(),  // ID del usuario que está realizando la actualización
        documents: z.array(z.object({
          name: z.string(),
          url: z.string(),
          uploadedBy: z.string(),
          notes: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Actualizar el nombre del review si es necesario
      const updatedReview = await ctx.db
        .update(validation)
        .set({
          name: input.name ?? undefined,  // Actualiza el nombre solo si se ha proporcionado
        })
        .where(eq(validation.id, input.id))
        .returning({ id: validation.id });

      // Actualizar los documentos si están presentes
      if (input.documents) {
        const documentPromises = input.documents.map(async (doc) => {
          await ctx.db.insert(validationDocuments).values({
            validationId: input.id,
            name: doc.name,
            url: doc.url,
            uploadedBy: doc.uploadedBy,
          });
        });

        await Promise.all(documentPromises);  // Asegura que todos los documentos se actualicen
      }

      return updatedReview;
    }),

  // Mutación para eliminar un documento
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Eliminar un documento específico
      await ctx.db.delete(validationDocuments).where(eq(validationDocuments.id, input.documentId));
    }),
});
