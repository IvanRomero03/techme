"use client";
import Markdown from "react-markdown";
import { api } from "techme/trpc/react";

export default function Summary({ projectId }: { projectId: string }) {
  const { data: summary, isFetching: fetchingStatus } =
    api.projectsSummary.getProjectSummary.useQuery({
      projectId: Number(projectId),
    });
  return (
    <div className="flex w-full flex-col">
      {fetchingStatus && <p>Loading...</p>}
      {
        <Markdown
          components={{
            ul: ({ children }) => (
              <ul className="list-disc pl-4">{children}</ul>
            ),
          }}
        >
          {summary != undefined || summary != null
            ? typeof summary === "string"
              ? summary
              : summary.join("")
            : "..."}
        </Markdown>
      }
    </div>
  );
}
