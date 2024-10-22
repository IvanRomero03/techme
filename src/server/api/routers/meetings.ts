import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { meetings, peoplePerMeeting } from "techme/server/db/schema";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({
  getProjectMeetings: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const projectMeetings = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.projectId, input.projectId))
        .orderBy(meetings.date);

      return projectMeetings;
    }),

  addMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        date: z.string(),
        description: z.string().optional(),
        createdBy: z.string(),
        attendees: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First create the meeting
        const [newMeeting] = await ctx.db
          .insert(meetings)
          .values({
            projectId: input.projectId,
            title: input.title,
            date: new Date(input.date),
            description: input.description ?? null,
            createdBy: input.createdBy,
            modifiedBy: input.createdBy,
          })
          .returning();

        // If we have attendees and the meeting was created successfully
        if (newMeeting && input.attendees && input.attendees.length > 0) {
          // Create the attendee records one by one to avoid parameter binding issues
          for (const userId of input.attendees) {
            await ctx.db
              .insert(peoplePerMeeting)
              .values({
                meetingId: newMeeting.id,
                userId: userId,
                createdBy: input.createdBy,
                modifiedBy: input.createdBy,
              });
          }
        }

        return newMeeting;
      } catch (error) {
        console.error("Meeting creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create meeting",
        });
      }
    }),

  deleteMeeting: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(meetings)
        .where(eq(meetings.id, input.id));
    }),

  updateMeeting: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
        modifiedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedMeeting = await ctx.db
        .update(meetings)
        .set({
          title: input.title,
          date: input.date ? new Date(input.date) : undefined,
          description: input.description,
          modifiedBy: input.modifiedBy,
        })
        .where(eq(meetings.id, input.id));

      return updatedMeeting;
    }),
});

export const peoplePerMeetingRouter = createTRPCRouter({
  getMeetingAttendees: protectedProcedure
    .input(z.object({ meetingId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(peoplePerMeeting)
        .where(eq(peoplePerMeeting.meetingId, input.meetingId));
    }),

  addPersonToMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.number(),
        userId: z.string(),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .insert(peoplePerMeeting)
        .values({
          meetingId: input.meetingId,
          userId: input.userId,
          createdBy: input.createdBy,
          modifiedBy: input.createdBy,
        });
    }),

  removePersonFromMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(peoplePerMeeting)
        .where(
          and(
            eq(peoplePerMeeting.meetingId, input.meetingId),
            eq(peoplePerMeeting.userId, input.userId)
          )
        );
    }),
});