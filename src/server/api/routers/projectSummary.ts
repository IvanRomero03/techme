import { z } from "zod";

import { eq } from "drizzle-orm";
import { readableRole } from "techme/app/members/columns";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import { projects } from "techme/server/db/schema";

export const projectsRouterSummary = createTRPCRouter({
  getProjectSummary: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));
      if (!(project.length > 0) && project[0] !== undefined) {
        return [];
      }
      const QueryKey =
        "project_summary_" + project[0]!.id + "_" + ctx.session.user.role;

      try {
        const cachedSummary = await ctx.cache.get(QueryKey);
        if (cachedSummary) {
          yield cachedSummary;
          return cachedSummary;
        }
      } catch (error) {}

      const openai = getOpenAI();
      const summary = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Eres un robot que ayuda a un " +
              readableRole(ctx.session.user.role) +
              " para resumir su proyecto, tu tarea es dar la información más relevante y concisa sobre el proyecto." +
              " Ayudalo a cumplir con sus objetivos para poder desarrollar una preventa del proyecto." +
              " Por favor intenta hacer el resumen lo más corto posible y usa bullet points (-) para hacerlo más legible." +
              " EVITA dar información que no sea relevante para el proyecto. EVITA dar el mensaje a modo de chat o conversación solo da el resumen. EVITA repetir el nombre del proyecto en el resumen.",
          },
          {
            role: "user",
            content:
              "El proyecto se llama: " +
              project[0]!.name +
              " is su descripcion es la siguiente: " +
              project[0]!.description,
          },
        ],
        stream: true,
      });
      let snapshot = "";
      for await (const response of summary) {
        if (response.choices[0]?.delta?.content) {
          snapshot += response.choices[0]?.delta?.content;
          yield response.choices[0]?.delta?.content;
        }
      }
      await ctx.cache.set(QueryKey, snapshot, {
        EX: 60 * 60 * 24 * 7,
      });
      return snapshot;
    }),
});
