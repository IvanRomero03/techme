import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import {
  estimations,
  projects,
  documentEmbeddings,
} from "techme/server/db/schema";
import { readableRole } from "techme/util/UserRole";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { getSupabaseClient } from "techme/server/db/storage";

export const projectEstimatesRouter = createTRPCRouter({
  getProjectEstimate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!(project.length > 0) || project[0] === undefined) {
        return [];
      }

      const QueryKey = `project_estimate_${project[0].id}_${ctx.session.user.role}`;

      try {
        const cachedEstimate = await ctx.cache.get(QueryKey);
        if (cachedEstimate) {
          yield cachedEstimate;
          return cachedEstimate;
        }
      } catch (error) {
        console.error("Failed to get cache on getProjectEstimate", error);
      }

      const openai = getOpenAI();
      const estimate = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Desarrollo de Estimacion financiera: Módulo para crear estimacion de costos de acuerdo a horas y perfiles.",
          },
          {
            role: "user",
            content:
              "El proyecto se llama: " +
              project[0].name +
              " y su descripción es la siguiente: " +
              project[0].description,
          },
        ],
        stream: true,
      });

      let snapshot = "";
      for await (const response of estimate) {
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

  unsetCacheProjectEstimate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const QueryKey = `project_estimate_${input.projectId}_${ctx.session.user.role}`;
      await ctx.cache.del(QueryKey);
    }),

  getRecomendations: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      const estimati = await ctx.db
        .select()
        .from(estimations)
        .where(eq(estimations.projectId, input.projectId));

      if (!(project.length > 0) || project[0] === undefined) {
        return [];
      }

      const context = {
        role: readableRole(ctx.session.user.role),
        projectDescription: project[0].description,
        estimations: estimati.map((estimation) => {
          return {
            name: estimation.phase,
            description: estimation.notes,
            manforceQuantity: estimation.manforce,
            manforceType: estimation.manforceUnit,
            timeEstimation: estimation.timeEstimation,
            timeEstimationUnit: estimation.timeUnit,
          };
        }),
      };
      // join context into a single string
      const chat_query =
        "Recomendaciones de fases y sus estimaciones para el proyecto: " +
        context.projectDescription +
        " para un " +
        context.role +
        " con las siguientes estimaciones: " +
        context.estimations
          .map((estimation) => {
            return (
              estimation.name +
              " con una duración de " +
              estimation.timeEstimation +
              " " +
              estimation.timeEstimationUnit +
              " y " +
              estimation.manforceQuantity +
              " " +
              estimation.manforceType +
              " asignados."
            );
          })
          .join(" ");

      const openai = getOpenAI();
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chat_query,
      });

      if (!embedding.data[0]?.embedding) {
        throw new Error("Failed to get embedding");
      }
      console.log(embedding.data[0]?.embedding);
      const client = await getSupabaseClient();
      let closestContext;
      try {
        //<
        //  (typeof documentEmbeddings)[]
        //>
        const contx = (await client.rpc("similarity_search_documents", {
          embeddingin: embedding.data[0].embedding,
          match_count: 3,
        })) as {
          data: {
            similarity: number;
            texto: string;
            document_id: string;
          }[];
        };
        closestContext = contx.data;
      } catch (error) {
        console.error("Failed to get closest context", error);
      }

      console.log(closestContext);
      if (!closestContext) {
        return [];
      }
      const chunks = closestContext.map((context) => context.texto);
      console.log(chunks);

      const estimate = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content:
              "Brinda recomendaciones de fases y estimaciones para el proyecto.",
          },
          {
            role: "user",
            content: chat_query,
          },
        ],
        response_format: responseFormat,
        stream: true,
      });

      let snapshot = "";
      for await (const response of estimate) {
        if (response.choices[0]?.delta?.content) {
          snapshot += response.choices[0]?.delta?.content;
          yield response.choices[0]?.delta?.content;
        }
      }
    }),
});

export const responseFormat = zodResponseFormat(
  z.object({
    estimations: z.array(
      z.object({
        phase: z.string(),
        notes: z.string(),
        manforceNumber: z.number(),
        manforceType: z.string(),
        timeEstimation: z.number(),
        timeUnit: z.string(),
      }),
    ),
  }),
  "estimations",
);
