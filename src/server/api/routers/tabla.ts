import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "techme/server/api/trpc";
import { tabla } from "techme/server/db/schema";

export const tablaRouter = createTRPCRouter({
  crear: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tabla).values({ name: input.name });
    }),
  listar: protectedProcedure.query((ctx) => {
    return ctx.ctx.db.query.tabla.findMany();
  }),
});
