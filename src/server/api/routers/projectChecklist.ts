import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import { estimations, projects, requirements } from "techme/server/db/schema";
import { readableRole } from "techme/util/UserRole";

export const projectChecklistRouter = createTRPCRouter({
  getProjectChecklist: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!project.length || !project[0]) {
        return [];
      }

      const QueryKey = `project_checklist_${project[0].id}_${ctx.session.user.role}`;

      try {
        const cachedChecklist = await ctx.cache.get(QueryKey);
        if (cachedChecklist) {
          yield cachedChecklist;
          return cachedChecklist;
        }
      } catch (error) {
        console.error("Failed to get cache on getProjectChecklist", error);
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
      const checklist = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Checklist de Completitud: Ejecución de una lista de verificación para asegurar la completitud de la propuesta.",
          },
          {
            role: "user",
            content: context,
          },
        ],
        stream: true,
      });

      let snapshot = "";
      for await (const response of checklist) {
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

  unsetCacheProjectChecklist: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const QueryKey = `project_checklist_${input.projectId}_${ctx.session.user.role}`;
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

      if (!project.length || !project[0]) {
        return "No se encontró el proyecto.";
      }

      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente especializado en listas de verificación de proyectos. Proporciona respuestas detalladas y específicas según las necesidades del usuario en relación con la completitud del proyecto.",
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
