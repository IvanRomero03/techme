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

// Define el tipo ValidationDocument
interface ValidationDocument {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  validationId: number;
}

// Define el tipo ValidationReview
export interface ValidationReview {
  id: number;
  name: string;
  userId: string;
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
        projectId: z.number(),
        documents: z.array(
          z.object({
            name: z.string(),
            url: z.string(),
            uploadedBy: z.string(),
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
          projectId: input.projectId,
          isFinal: false,
        })
        .returning({ id: validation.id });

      const reviewId = review[0]?.id;

      if (!reviewId) {
        throw new Error("Error creating review, reviewId is undefined.");
      }

      const documentPromises = input.documents.map(async (doc) => {
        const existingDocument = await ctx.db
          .select({ id: validationDocuments.id })
          .from(validationDocuments)
          .where(
            and(
              eq(validationDocuments.name, doc.name),
              eq(validationDocuments.validationId, reviewId)
            )
          )
          .limit(1);

        if (existingDocument.length > 0) {
          console.warn(
            `Documento con nombre "${doc.name}" ya existe. Se omitirá.`
          );
          return;
        }

        const insertedDoc = await ctx.db
          .insert(validationDocuments)
          .values({
            validationId: reviewId,
            name: doc.name,
            url: doc.url,
            uploadedBy: doc.uploadedBy,
            status: "pending",
          })
          .returning({ id: validationDocuments.id });

        const documentId = insertedDoc[0]?.id;

        if (!documentId) {
          throw new Error("Error inserting document, documentId is undefined.");
        }

        if (doc.notes) {
          await ctx.db.insert(validationDocumentNotes).values({
            documentId: documentId,
            note: doc.notes,
            createdBy: input.userId,
            type: "comment",
          });
        }
      });

      try {
        await Promise.all(documentPromises);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Error inserting documents: " + error.message);
        } else {
          throw new Error("Unknown error inserting documents");
        }
      }

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
            relatedId: review[0]?.id,
          }))
        );
      }

      return { id: review[0]?.id };
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
                  'notes', ${validationDocumentNotes.note},
                  'status', ${validationDocuments.status},
                  'statusUpdatedAt', ${validationDocuments.statusUpdatedAt},
                  'statusUpdatedBy', ${validationDocuments.statusUpdatedBy},
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
        userId: review.userId ?? "",
        projectId: review.projectId,
        documents: review.documents ?? [],
        createdAt: review.createdAt ?? new Date(),
        isFinal: review.isFinal ?? false,
        completedAt: review.completedAt,
      }));
    }),

  finalizeReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        userId: z.string(),
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const finalizedReview = await ctx.db
        .update(validation)
        .set({
          isFinal: true,
          completedAt: new Date(),
        })
        .where(eq(validation.id, input.reviewId))
        .returning({
          id: validation.id,
          name: validation.name,
        });

      if (!finalizedReview[0]?.id) {
        throw new Error("Error finalizing review, reviewId is undefined.");
      }

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
            title: "Validation Review Finalized",
            message: `The validation review "${finalizedReview[0]?.name}" has been finalized`,
            type: NotificationType.DOCUMENT_VALIDATED,
            relatedId: finalizedReview[0]?.id,
          }))
        );
      }

      return { id: finalizedReview[0]?.id };
    }),
});
