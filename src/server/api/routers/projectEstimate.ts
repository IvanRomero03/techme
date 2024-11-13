import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "techme/server/api/trpc";
import getOpenAI from "techme/server/chatgpt/openai";
import { estimations, projects } from "techme/server/db/schema";
import { readableRole } from "techme/util/UserRole";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { getSupabaseClient } from "techme/server/db/storage";

// Response format schema for OpenAI completion
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

export const projectEstimatesRouter = createTRPCRouter({
  getProjectEstimate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      // Retrieve project details from the database
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId));

      if (!(project.length > 0) || project[0] === undefined) {
        return [];
      }

      // Define cache key
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

      // Initialize OpenAI and send a completion request
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

      // Store the result in the cache
      await ctx.cache.set(QueryKey, snapshot, {
        EX: 60 * 60 * 24 * 7, // Cache for one week
      });

      return snapshot;
    }),

  unsetCacheProjectEstimate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const QueryKey = `project_estimate_${input.projectId}_${ctx.session.user.role}`;
      await ctx.cache.del(QueryKey);
    }),

  getRecommendations: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async function* ({ ctx, input }) {
      // Retrieve project and estimation details
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

      // Prepare context with role, description, and estimations
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

      // Convert context to query string for OpenAI embedding
      const chatQuery =
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

      // Create embedding with OpenAI for similarity search
      const openai = getOpenAI();
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chatQuery,
      });

      if (!embedding.data[0]?.embedding) {
        throw new Error("Failed to get embedding");
      }

      // Retrieve similar documents from Supabase
      const client = await getSupabaseClient();
      let closestContext;
      try {
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

      if (!closestContext) {
        return [];
      }

      const chunks = closestContext.map((context) => context.texto);

      // Generate recommendations based on the project context
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
            content: chatQuery,
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
