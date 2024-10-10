import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import { meetings, peoplePerMeeting, users } from "techme/server/db/schema";


export const meetingsRouter = createTRPCRouter({

  getProjectMeetings: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const projectMeetings = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.projectId, input.projectId))
        .orderBy(sql`${meetings.date} ASC`);

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
  
      const [newMeeting] = await ctx.db
        .insert(meetings)
        .values({
          projectId: input.projectId,
          title: input.title,
          date: new Date(input.date),
          description: input.description,
          createdBy: input.createdBy,
          modifiedBy: input.createdBy,
        })
        .returning({ id: meetings.id });


      if (newMeeting && input.attendees && input.attendees.length > 0) {
        await ctx.db.insert(peoplePerMeeting).values(
          input.attendees.map((userId) => ({
            meetingId: newMeeting.id,
            userId,
            createdBy: input.createdBy,
            modifiedBy: input.createdBy,
          }))
        );
      }

      return newMeeting;
    }),


  deleteMeeting: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(meetings).where(eq(meetings.id, input.id));
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
      const attendees = await ctx.db
        .select()
        .from(peoplePerMeeting)
        .where(eq(peoplePerMeeting.meetingId, input.meetingId));

      return attendees;
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
      const newInvite = await ctx.db.insert(peoplePerMeeting).values({
        meetingId: input.meetingId,
        userId: input.userId,
        createdBy: input.createdBy,
        modifiedBy: input.createdBy,
      });

      return newInvite;
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
          sql`${peoplePerMeeting.meetingId} = ${input.meetingId} AND ${peoplePerMeeting.userId} = ${input.userId}`
        );
    }),


  updatePersonInvite: protectedProcedure
    .input(
      z.object({
        meetingId: z.number(),
        userId: z.string(),
        modifiedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedInvite = await ctx.db
        .update(peoplePerMeeting)
        .set({
          modifiedBy: input.modifiedBy,
        })
        .where(
          sql`${peoplePerMeeting.meetingId} = ${input.meetingId} AND ${peoplePerMeeting.userId} = ${input.userId}`
        );

      return updatedInvite;
    }),
});
