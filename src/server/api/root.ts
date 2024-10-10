import { createCallerFactory, createTRPCRouter } from "techme/server/api/trpc";
import { membersRouter } from "./routers/members";
import { projectsRouter } from "./routers/projects";
import { projectsRouterSummary } from "./routers/projectSummary";
import { requirementsRouter } from "./routers/requirements";
import { projectsRouterTasks } from "./routers/projectTasks";
import { validationRouter } from "./routers/validation";
import {documentNotesRouter} from "./routers/documentNotes";
import {reviewSubmissionRouter} from "./routers/reviews";

//se crea los enlaces de conexión de la base de datos y la vista
//las rutas de la api

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  members: membersRouter,
  projects: projectsRouter,
  projectsSummary: projectsRouterSummary,
  requirements: requirementsRouter,
  prjectTasks: projectsRouterTasks,
  validation: validationRouter,
  documentNotes: documentNotesRouter,
  reviews: reviewSubmissionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
