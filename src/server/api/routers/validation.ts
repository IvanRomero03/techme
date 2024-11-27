import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "techme/server/api/trpc";
import {
  validation,
  validationDocuments,
  validationDocumentNotes,
  validationDocumentLikes,
  notifications,
  peoplePerProject,
  NotificationType,
} from "techme/server/db/schema";
import { eq, sql, and } from "drizzle-orm";

interface ValidationDocument {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  notes?: string;
  noteCreatedAt?: Date;
  status: "pending" | "approved" | "rejected";
  validationId: number;
}

export interface ValidationReview {
  id: number;
  name: string;
  userId: string;
  createdByName: string;
  projectId: number;
  documents: ValidationDocument[];
  createdAt: Date;
  isFinal: boolean;
  completedAt: Date | null;
}

export const validationRouter = createTRPCRouter({
  createReview: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
        userName: z.string(),
        projectId: z.number(),
        documents: z.array(
          z.object({
            name: z.string(),
            url: z.string(),
            uploadedBy: z.string(),
            uploadedByName: z.string(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db
        .insert(validation)
        .values({
          name: input.name,
          userId: input.userId,
          createdByName: input.userName,
          projectId: input.projectId,
          isFinal: false,
        })
        .returning({ id: validation.id });

      const reviewId = review[0]?.id;

      if (!reviewId) {
        throw new Error("Error creating review, reviewId is undefined.");
      }

      const documentPromises = input.documents.map(async (doc) => {
        const insertedDoc = await ctx.db
          .insert(validationDocuments)
          .values({
            validationId: reviewId,
            name: doc.name,
            url: doc.url,
            uploadedBy: doc.uploadedBy,
            uploadedByName: doc.uploadedByName,
            status: "pending",
          })
          .returning({ id: validationDocuments.id });

        const documentId = insertedDoc[0]?.id;

        if (!documentId) {
          throw new Error("Error inserting document, documentId is undefined.");
        }

        if (doc.notes) {
          await ctx.db.insert(validationDocumentNotes).values({
            documentId,
            note: doc.notes,
            createdBy: input.userId,
            createdByName: input.userName,
            createdAt: new Date(),
            type: "comment",
          });
        }
      });

      await Promise.all(documentPromises);

      const projectMembers = await ctx.db
        .select({
          userId: peoplePerProject.userId,
        })
        .from(peoplePerProject)
        .where(eq(peoplePerProject.projectId, input.projectId));

      const validMembers = projectMembers.filter(
        (member): member is { userId: string } => member.userId != null
      );

      if (validMembers.length > 0) {
        await ctx.db.insert(notifications).values(
          validMembers.map((member) => ({
            userId: member.userId,
            title: "New Validation Review",
            message: `A new validation review "${input.name}" has been created`,
            type: NotificationType.VALIDATION_ADDED,
            relatedId: reviewId,
          }))
        );
      }

      return { id: reviewId };
    }),

  getAllReviews: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        projectId: z.number(),
      })
    )
    .query(async ({ ctx, input }): Promise<ValidationReview[]> => {
      const reviews = await ctx.db
        .select({
          id: validation.id,
          name: validation.name,
          userId: validation.userId,
          createdByName: validation.createdByName,
          projectId: validation.projectId,
          createdAt: validation.createdAt,
          isFinal: validation.isFinal,
          completedAt: validation.completedAt,
          documents: sql<ValidationDocument[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${validationDocuments.id},
                  'name', ${validationDocuments.name},
                  'url', ${validationDocuments.url},
                  'uploadedBy', ${validationDocuments.uploadedBy},
                  'uploadedByName', ${validationDocuments.uploadedByName},
                  'notes', ${validationDocumentNotes.note},
                  'noteCreatedAt', ${validationDocumentNotes.createdAt},
                  'status', ${validationDocuments.status},
                  'validationId', ${validationDocuments.validationId}
                )
              ) FILTER (WHERE ${validationDocuments.id} IS NOT NULL),
              '[]'
            )
          `.as('documents'),
        })
        .from(validation)
        .leftJoin(
          validationDocuments,
          eq(validationDocuments.validationId, validation.id)
        )
        .leftJoin(
          validationDocumentNotes,
          eq(validationDocumentNotes.documentId, validationDocuments.id)
        )
        .where(eq(validation.projectId, input.projectId))
        .groupBy(validation.id);

      return reviews.map((review): ValidationReview => ({
        id: review.id,
        name: review.name,
        userId: review.userId ?? "", // Valor por defecto si es null
        createdByName: review.createdByName,
        projectId: review.projectId,
        documents: review.documents || [],
        createdAt: review.createdAt ?? new Date(), // Valor por defecto si es null
        isFinal: review.isFinal ?? false,
        completedAt: review.completedAt,
      }));
    }),

  finalizeReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(validation)
        .set({
          isFinal: true,
          completedAt: new Date(),
        })
        .where(eq(validation.id, input.reviewId))
        .returning({ id: validation.id });

      if (result.length === 0) {
        throw new Error(`Review with ID ${input.reviewId} not found or could not be updated.`);
      }

      return { success: true };
    }),
});
