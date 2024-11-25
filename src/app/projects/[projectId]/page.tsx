"use client";

import { cn } from "lib/utils";
import { useState } from "react";
import { api } from "techme/trpc/react";
import Details from "./Details";
import Estimations from "./Estimations";
import Requirements from "./Requirements";
import Summary from "./Summary";
import { Documents } from "./Documents";
import Proposals from "./Proposals";
import Analysis from "./Analysis";
import Planning from "./Planning";
import Validation from "./Validation";
import { UserRole } from "techme/util/UserRole";
import { useSession } from "next-auth/react";

const menuItems = [
  "Summary",
  "Details",
  "Documentation",
  "Requirements",
  "Planning",
  "Analysis",
  "Estimations",
  "Proposals",
  "Validation",
] as const;

type ObjectValues<T> = T[keyof T];

type MenuItem = ObjectValues<typeof menuItems>;

const permissions: Record<UserRole, MenuItem[]> = {
  [UserRole.Admin]: [
    "Summary",
    "Details",
    "Documentation",
    "Requirements",
    "Planning",
    "Analysis",
    "Estimations",
    "Proposals",
    "Validation",
  ],
  [UserRole.Comercial]: [
    "Summary",
    "Details",
    "Documentation",
    "Requirements",
    "Planning",
    "Proposals",
    "Analysis",
  ],
  [UserRole.DigitalLead]: [
    "Summary",
    "Details",
    "Documentation",
    "Requirements",
    "Planning",
    "Proposals",
    "Analysis",
  ],
  [UserRole.GDM]: [
    "Summary",
    "Details",
    "Documentation",
    "Requirements",
    "Planning",
    "Analysis",
    "Estimations",
    "Proposals",
    "Validation",
  ],
  [UserRole.LeadPresales]: [
    "Summary",
    "Details",
    "Documentation",
    "Analysis",
    "Proposals",
  ],
  [UserRole.ProjectManager]: [
    "Summary",
    "Details",
    "Documentation",
    "Analysis",
    "Requirements",
    "Estimations",
    "Validation",
  ],
  [UserRole.Unauthorized]: [],
};

export default function Page({ params }: { params: { projectId: string } }) {
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>(menuItems[0]);
  const { data: projectDetails, isLoading: isLoadingProjectDetails } =
    api.projects.getProyectInfo.useQuery({
      projectId: Number(params.projectId),
    });

  const session = useSession();

  const userPermissions =
    permissions[session?.data?.user.role ?? UserRole.Unauthorized];

  const handleMenuClick = (item: MenuItem) => {
    setActiveMenuItem(item);
  };

  if (isLoadingProjectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 text-2xl font-bold">
        Project: {projectDetails?.project.name}
      </h1>
      <div className="flex h-full w-full">
        <div className="my-4 w-1/5 rounded-2xl bg-gray-100 p-4">
          <ul className="space-y-2">
            {userPermissions.map((item) => (
              <li key={String(item)}>
                <button
                  className={cn(
                    "w-full rounded-md px-4 py-2 text-left transition-colors",
                    activeMenuItem === item ? "bg-gray-200" : "bg-transparent",
                  )}
                  onClick={() => handleMenuClick(item)}
                >
                  {String(item)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">{String(activeMenuItem)}</h2>
          {activeMenuItem === "Estimations" &&
          userPermissions.includes("Estimations") ? (
            <Estimations projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Details" &&
            userPermissions.includes("Details") ? (
            <Details projectId={params.projectId} />
          ) : activeMenuItem === "Summary" &&
            userPermissions.includes("Summary") ? (
            <Summary projectId={params.projectId} />
          ) : activeMenuItem === "Requirements" &&
            userPermissions.includes("Requirements") ? (
            <Requirements projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Proposals" &&
            userPermissions.includes("Proposals") ? (
            <Proposals projectId={params.projectId} />
          ) : activeMenuItem === "Documentation" &&
            userPermissions.includes("Documentation") ? (
            <Documents projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Analysis" &&
            userPermissions.includes("Analysis") ? (
            <Analysis projectId={params.projectId} />
          ) : activeMenuItem === "Planning" &&
            userPermissions.includes("Planning") ? (
            <Planning projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Validation" &&
            userPermissions.includes("Validation") ? (
            <Validation validationId={Number(params.projectId)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
