import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import { projects } from "techme/server/db/schema";
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

      const QueryKey = `project_checklist_${project[0]!.id}_${ctx.session.user.role}`;

      try {
        const cachedChecklist = await ctx.cache.get(QueryKey);
        if (cachedChecklist) {
          yield cachedChecklist;
          return cachedChecklist;
        }
      } catch (error) {
        console.error("Failed to get cache on getProjectChecklist", error);
      }

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
            content:
              "El proyecto se llama: " +
              project[0]!.name +
              " y su descripción es la siguiente: " +
              project[0]!.description,
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
});
