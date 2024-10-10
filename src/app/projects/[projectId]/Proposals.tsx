"use client";
import { RefreshCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader } from "t/components/ui/card";
import { api } from "techme/trpc/react";

export default function Proposals({ projectId }: { projectId: string }) {
  const { data: proposals, isFetching: fetchingProposals } =
    api.projectProposals.getProjectProposal.useQuery({
      projectId: Number(projectId),
    });

  const { data: estimates, isFetching: fetchingEstimates } =
    api.projectEstimate.getProjectEstimate.useQuery({
      projectId: Number(projectId),
    });

  const { data: checklist, isFetching: fetchingChecklist } =
    api.projectChecklist.getProjectChecklist.useQuery({
      projectId: Number(projectId),
    });

  const { mutateAsync: refreshProposals } =
    api.projectProposals.unsetCacheProjectProposal.useMutation();

  const { mutateAsync: refreshEstimates } =
    api.projectEstimate.unsetCacheProjectEstimate.useMutation();

  const { mutateAsync: refreshChecklist } =
    api.projectChecklist.unsetCacheProjectChecklist.useMutation();

  const utils = api.useUtils();

  return (
    <CardContent className="flex h-full w-full flex-col gap-4">
      {/* Proposals Section */}
      <Card className="relative h-2/3 w-full overflow-auto pt-6">
        <CardContent className="max-h-[70vh]">
          <Button
            onClick={async () => {
              await refreshProposals({ projectId: Number(projectId) });
              await utils.projectProposals.getProjectProposal.refetch({
                projectId: Number(projectId),
              });
            }}
            className="absolute right-2 top-2"
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          {fetchingProposals && <p>Loading Proposals...</p>}
          {
            <Markdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc pl-4">{children}</ul>
                ),
              }}
            >
              {proposals?.join("") ?? "..."}
            </Markdown>
          }
        </CardContent>
      </Card>

      {/* Estimates Section */}
      <Card className="flex h-full flex-col mt-4">
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">Estimate</h1>
            <Button
              onClick={async () => {
                await refreshEstimates({ projectId: Number(projectId) });
                await utils.projectEstimate.getProjectEstimate.refetch({
                  projectId: Number(projectId),
                });
              }}
              variant={"ghost"}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-auto">
          {fetchingEstimates && <p>Loading Estimates...</p>}
          {
            <Markdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc pl-4">{children}</ul>
                ),
              }}
            >
              {estimates?.join("") ?? "..."}
            </Markdown>
          }
        </CardContent>
      </Card>

      {/* Checklist Section */}
      <Card className="flex h-full flex-col mt-4">
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">Checklist</h1>
            <Button
              onClick={async () => {
                await refreshChecklist({ projectId: Number(projectId) });
                await utils.projectChecklist.getProjectChecklist.refetch({
                  projectId: Number(projectId),
                });
              }}
              variant={"ghost"}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-auto">
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
    </CardContent>
  );
}
