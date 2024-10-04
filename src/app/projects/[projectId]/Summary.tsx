"use client";
import { RefreshCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader } from "t/components/ui/card";
import { api } from "techme/trpc/react";
import KanBan from "./KanBan/KanBan";
import TaskModal from "./TaskModal";

export default function Summary({ projectId }: { projectId: string }) {
  const { data: summary, isFetching: fetchingStatus } =
    api.projectsSummary.getProjectSummary.useQuery({
      projectId: Number(projectId),
    });

  const { mutateAsync: refreshSummary } =
    api.projectsSummary.unsetCacheProjectSummary.useMutation();

  const utils = api.useUtils();

  return (
    <CardContent className="flex h-full w-full flex-col gap-4">
      <Card className="relative h-1/3 w-1/2 overflow-auto pt-6">
        <CardContent>
          <Button
            onClick={async () => {
              await refreshSummary({ projectId: Number(projectId) });
              await utils.projectsSummary.getProjectSummary.refetch({
                projectId: Number(projectId),
              });
            }}
            className="absolute right-2 top-2"
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          {fetchingStatus && <p>Loading...</p>}
          {
            <Markdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc pl-4">{children}</ul>
                ),
              }}
            >
              {summary?.join("") ?? "..."}
            </Markdown>
          }
        </CardContent>
      </Card>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">Tasks</h1>
            <TaskModal proyectId={Number(projectId)} newTask />
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <KanBan projectId={Number(projectId)} />
        </CardContent>
      </Card>
    </CardContent>
  );
}
