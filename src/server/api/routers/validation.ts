import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { validation, validationDocuments, validationDocumentNotes, validationDocumentLikes, notifications, peoplePerProject, NotificationType } from "techme/server/db/schema";
import { eq, sql } from "drizzle-orm"; 

export const validationRouter = createTRPCRouter({
  createReview: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
        projectId: z.number(),
        documents: z.array(z.object({
          name: z.string(),
          url: z.string(),
          uploadedBy: z.string(),
          notes: z.string().optional(),
        })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db
        .insert(validation)
        .values({
          name: input.name,
          userId: input.userId,
          isFinal: false,
        })
        .returning({ id: validation.id });

      const reviewId = review[0]?.id;

      if (!reviewId) {
        throw new Error("Error creating review, reviewId is undefined.");
      }

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

      const validMembers = projectMembers.filter((member): member is { userId: string } => 
        member.userId != null
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

  finalizeReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        userId: z.string(),
        projectId: z.number(),
      }),
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
          name: validation.name 
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

      const validMembers = projectMembers.filter((member): member is { userId: string } => 
        member.userId != null
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


  updateReview: protectedProcedure
    .input(
      z.object({
        id: z.number(),  
        name: z.string().optional(), 
        userId: z.string(), 
        projectId: z.number(),
        documents: z.array(z.object({
          name: z.string(),
          url: z.string(),
          uploadedBy: z.string(),
          notes: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const updatedReview = await ctx.db
        .update(validation)
        .set({
          name: input.name ?? undefined,  
        })
        .where(eq(validation.id, input.id))
        .returning({ 
          id: validation.id,
          name: validation.name 
        });

      if (!updatedReview[0]) {
        throw new Error("Error updating review, no review found.");
      }


      if (input.documents) {
        const documentPromises = input.documents.map(async (doc) => {
          await ctx.db.insert(validationDocuments).values({
            validationId: input.id,
            name: doc.name,
            url: doc.url,
            uploadedBy: doc.uploadedBy,
          });
        });

        await Promise.all(documentPromises);  
      }

      const projectMembers = await ctx.db
        .select({
          userId: peoplePerProject.userId,
        })
        .from(peoplePerProject)
        .where(eq(peoplePerProject.projectId, input.projectId));


      const validMembers = projectMembers.filter((member): member is { userId: string } => 
        member.userId != null
      );

      if (validMembers.length > 0) {
        await ctx.db.insert(notifications).values(
          validMembers.map((member) => ({
            userId: member.userId,
            title: "New Validation Review",
            message: `A new validation review "${input.name}" has been created`,
            type: NotificationType.VALIDATION_ADDED,
            relatedId: updatedReview[0]!.id,
          }))
        );
      }

      return { id: updatedReview[0]?.id };
    }),
    

  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {

      await ctx.db.delete(validationDocuments).where(eq(validationDocuments.id, input.documentId));
    }),
});
