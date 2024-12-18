import { createCallerFactory, createTRPCRouter } from "techme/server/api/trpc";
import { membersRouter } from "./routers/members";
import { projectsRouter } from "./routers/projects";
import { projectsRouterSummary } from "./routers/projectSummary";
import { requirementsRouter } from "./routers/requirements";
import { projectsRouterTasks } from "./routers/projectTasks";
import { frameworkContractsRouter } from "./routers/frameworkContractsRouter";
import { projectsEstimationsRouter } from "./routers/estimations";
import { documentsRouter } from "./routers/documents";
import { projectProposalsRouter } from "./routers/projectProposals";
import { projectEstimatesRouter } from "./routers/projectEstimate";
import { projectChecklistRouter } from "./routers/projectChecklist";
import { meetingsRouter, peoplePerMeetingRouter } from "./routers/meetings";
import { validationRouter } from "./routers/validation";
import { notificationsRouter } from "./routers/notifications";
import { calendaryDatesRouter } from "./routers/CalendaryDates";
import { CalendaryMeetingsRouter } from "./routers/CalendaryMeetings";

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
  projectTasks: projectsRouterTasks,
  frameworkContracts: frameworkContractsRouter,
  projectProposals: projectProposalsRouter,
  projectEstimate: projectEstimatesRouter,
  projectChecklist: projectChecklistRouter,
  estimations: projectsEstimationsRouter,
  documents: documentsRouter,
  meetings: meetingsRouter,
  peoplePerMeeting: peoplePerMeetingRouter,
  validation:  validationRouter,
  notifications: notificationsRouter,
  calendaryDates: calendaryDatesRouter,
  calendaryMeetings: CalendaryMeetingsRouter,
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
