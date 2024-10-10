"use client";
import { RefreshCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader } from "t/components/ui/card";
import { api } from "techme/trpc/react";

export default function Checklist({ projectId }: { projectId: string }) {
  const { data: checklist, isFetching: fetchingChecklist } =
    api.projectChecklist.getProjectChecklist.useQuery({
      projectId: Number(projectId),
    });

  const { mutateAsync: refreshChecklist } =
    api.projectChecklist.unsetCacheProjectChecklist.useMutation();

  const utils = api.useUtils();

  return (
    <CardContent className="flex h-full w-full flex-col gap-4">
      {/* Checklist Section */}
      <Card className="relative h-2/3 w-full overflow-auto pt-6">
        <CardContent className="max-h-[70vh]">
          <Button
            onClick={async () => {
              await refreshChecklist({ projectId: Number(projectId) });
              await utils.projectChecklist.getProjectChecklist.refetch({
                projectId: Number(projectId),
              });
            }}
            className="absolute right-2 top-2"
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          {fetchingChecklist && <p>Loading Checklist...</p>}
          {
            <Markdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc pl-4">{children}</ul>
                ),
              }}
            >
              {checklist?.join("") ?? "..."}
            </Markdown>
          }
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col mt-4">
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">Checklist</h1>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <p>Detalles de la lista de verificación se mostrarán aquí.</p>
        </CardContent>
      </Card>
    </CardContent>
  );
}
