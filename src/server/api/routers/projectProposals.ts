import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import { estimations, projects, requirements } from "techme/server/db/schema";
import { readableRole } from "techme/util/UserRole";

export const projectProposalsRouter = createTRPCRouter({
  getProjectProposal: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!(project.length > 0) || project[0] === undefined) {
        return [];
      }

      const QueryKey = `project_proposal_${project[0].id}_${ctx.session.user.role}`;

      try {
        const cachedProposal = await ctx.cache.get(QueryKey);
        if (cachedProposal) {
          yield cachedProposal;
          return cachedProposal;
        }
      } catch (error) {
        console.error("Failed to get cache on getProjectProposal", error);
      }

      const reqs = await ctx.db
        .select()
        .from(requirements)
        .where(eq(requirements.projectId, input.projectId));

      const reqText = reqs
        .map((req) => req.title + " == " + req.description)
        .join("\n");

      const estimates = await ctx.db
        .select()
        .from(estimations)
        .where(eq(estimations.id, input.projectId));

      const estText = estimates
        .map(
          (est) =>
            est.phase +
            " == " +
            est.notes +
            " == " +
            est.manforce +
            " : " +
            est.manforceUnit +
            " ; " +
            est.timeEstimation +
            " : " +
            est.timeUnit,
        )
        .join("\n");

      const context =
        "El proyecto se llama: " +
        project[0].name +
        ". Descripción: " +
        project[0].description +
        ". Requerimientos: " +
        reqText +
        ". Estimaciones: " +
        estText;
      const openai = getOpenAI();
      const proposal = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Eres un robot que ayuda a un " +
              readableRole(ctx.session.user.role) +
              " para desarrollar y generar el cascarón de una propuesta." +
              " Tu tarea es repartir tareas entre las áreas digitales de acuerdo al contexto de la propuesta." +
              " Proporciona el desarrollo de la propuesta en forma de lista con puntos (-) para hacerlo más legible.",
          },
          {
            role: "user",
            content: context,
          },
        ],
        stream: true,
      });

      let snapshot = "";
      for await (const response of proposal) {
        if (response.choices[0]?.delta?.content) {
          snapshot += response.choices[0]?.delta?.content;
          yield response.choices[0]?.delta?.content;
        }
      }

      await ctx.cache.set(QueryKey, snapshot, {
        EX: 60 * 60 * 24 * 7, // Caché por una semana
      });

      return snapshot;
    }),

  unsetCacheProjectProposal: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const QueryKey = `project_proposal_${input.projectId}_${ctx.session.user.role}`;
      await ctx.cache.del(QueryKey);
    }),

  // Nuevo procedimiento para enviar mensajes a la IA
  sendMessageToAI: protectedProcedure
    .input(z.object({ projectId: z.number(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!(project.length > 0) || project[0] === undefined) {
        return "No se encontró el proyecto.";
      }

      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Eres un robot que ayuda a un " +
              readableRole(ctx.session.user.role) +
              " para desarrollar y ajustar propuestas." +
              " Proporciona respuestas basadas en la información del proyecto y los comentarios del usuario.",
          },
          {
            role: "user",
            content:
              "El proyecto se llama: " +
              project[0].name +
              ". Descripción: " +
              project[0].description,
          },
          {
            role: "user",
            content: input.message,
          },
        ],
      });

      return (
        response.choices[0]?.message?.content ??
        "No se pudo obtener una respuesta de la IA."
      );
    }),
});
