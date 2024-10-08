"use client";

import { cn } from "lib/utils";
import { useState } from "react";
import { api } from "techme/trpc/react";
import Details from "./Details";
import Estimations from "./Estimations";
import Requirements from "./Requirements";
import Summary from "./Summary";
import { Documents } from "./Documents";

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
];

export default function Page({ params }: { params: { projectId: string } }) {
  const [activeMenuItem, setActiveMenuItem] = useState(menuItems[0]);
  const { data: proyectDetails, isLoading: isLoadingProyectDetails } =
    api.projects.getProyectInfo.useQuery({
      projectId: Number(params.projectId),
    });

  const handleMenuClick = (item: string) => {
    setActiveMenuItem(item);
  };

  if (isLoadingProyectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 text-2xl font-bold">
        Project: {proyectDetails?.project.name}
      </h1>
      <div className="flex h-full w-full">
        <div className="my-4 w-1/5 rounded-2xl bg-gray-100 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item}>
                <button
                  className={cn(
                    "w-full rounded-md px-4 py-2 text-left transition-colors",
                    activeMenuItem === item ? "bg-gray-200" : "bg-transparent",
                  )}
                  onClick={() => handleMenuClick(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">{activeMenuItem}</h2>
          {activeMenuItem === "Estimations" ? (
            <Estimations projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Details" ? (
            <Details projectId={params.projectId} />
          ) : activeMenuItem === "Summary" ? (
            <Summary projectId={params.projectId} />
          ) : activeMenuItem === "Requirements" ? (
            <Requirements projectId={Number(params.projectId)} />
          ) : activeMenuItem === "Documentation" ? (
            <Documents projectId={Number(params.projectId)} />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
