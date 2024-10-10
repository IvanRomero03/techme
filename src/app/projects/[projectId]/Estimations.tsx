"use client";

import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import EstimationModal from "./Estimations/EstimationModal";
import { api } from "techme/trpc/react";
import { Label } from "t/components/ui/label";
import { parse } from "partial-json";
import type { responseFormat } from "techme/server/api/routers/projectEstimate";
import { useState } from "react";
import { Separator } from "t/components/ui/separator";
import { Skeleton } from "t/components/ui/skeleton";

export default function Estimations({ projectId }: { projectId: number }) {
  const { data: estimations, isLoading } =
    api.estimations.getProjectEstimations.useQuery({
      projectId,
    });
  const { mutateAsync: deleteEstimation } =
    api.estimations.deleteEstimation.useMutation();

  const { mutateAsync: createEstimation } =
    api.estimations.createEstimation.useMutation();

  const { data: recomendations } =
    api.projectEstimate.getRecomendations.useQuery({
      projectId,
    });

  let partialResponse: (typeof responseFormat)["__output"];
  try {
    const parsedRecomendations = parse(
      recomendations ? (recomendations?.join("") ?? "") : "",
      5,
    ) as (typeof responseFormat)["__output"];

    if (parsedRecomendations.estimations) {
      if (parsedRecomendations.estimations.length > 0) {
        const validEstimations =
          [] as (typeof responseFormat)["__output"]["estimations"];
        for (const estimation of parsedRecomendations.estimations) {
          try {
            if (
              estimation.phase &&
              estimation.timeEstimation &&
              estimation.timeUnit &&
              estimation.manforceType &&
              estimation.manforceNumber
            ) {
              validEstimations.push(estimation);
            }
          } catch (error) {
            console.error(error);
          }
        }
        partialResponse = { estimations: validEstimations };
      } else {
        partialResponse = { estimations: [] };
      }
    } else {
      partialResponse = { estimations: [] };
    }
  } catch (error) {
    console.error(error);
    partialResponse = { estimations: [] };
  }

  const [currentRecomendationIndex, setCurrentRecomendationIndex] = useState(0);

  const utils = api.useUtils();
  return (
    <div>
      <EstimationModal proyectId={projectId} newEstimation />
      <div className="mb-6 grid grid-cols-2 gap-5">
        {isLoading && <p>Loading...</p>}
        {estimations?.map((estimation) => (
          <Card key={estimation.id} className="bg-gray-50">
            <CardHeader>
              <CardTitle className="flex w-full items-center justify-between">
                <p>{estimation.phase}</p>
                <div className="flex gap-2">
                  <EstimationModal
                    proyectId={projectId}
                    estimation={{
                      ...estimation,
                      proyectId: projectId,
                      timeEstimation: {
                        value: estimation.timeEstimation!,
                        unit: estimation.timeUnit!,
                      },
                      manforce: {
                        value: estimation.manforce!,
                        unit: estimation.manforceUnit!,
                      },
                      notes: estimation.notes ?? "",
                    }}
                    newEstimation={false}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await deleteEstimation({ id: estimation.id });
                      await utils.estimations.getProjectEstimations.refetch({
                        projectId,
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent key={estimation.id} className="flex space-x-4">
              <Card className="px-4 py-2">
                <Label>Time Estimation</Label>
                <p>
                  {estimation.timeEstimation} {estimation.timeUnit}
                </p>
              </Card>
              <Card className="px-4 py-2">
                <Label>Manforce</Label>
                <p>
                  {estimation.manforce} {estimation.manforceUnit}
                </p>
              </Card>
            </CardContent>
            <CardContent>
              <Card className="px-4 py-2">
                <Label>Notes</Label>
                <p className="h-12 overflow-y-auto text-sm">
                  {estimation.notes}
                </p>
              </Card>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator className="my-4" />
      {partialResponse?.estimations.length === 0 ? (
        <Skeleton className="h-16 w-1/2" />
      ) : (
        <>
          <h2 className="text-xl font-bold">Recomendation</h2>
          <Card className="w-1/2 bg-gray-50">
            <CardHeader>
              <CardTitle className="flex justify-between">
                {partialResponse?.estimations[currentRecomendationIndex]?.phase}
                <div className="gap-4">
                  <Button
                    onClick={async () => {
                      setCurrentRecomendationIndex(
                        (prev) =>
                          (prev + 1) %
                          (partialResponse?.estimations.length ?? 1),
                      );
                      const estimation =
                        partialResponse?.estimations[currentRecomendationIndex];
                      await createEstimation({
                        ...estimation,
                        phase: estimation?.phase ?? "",
                        notes: estimation?.notes ?? "",
                        projectId,
                        manforce: {
                          value: estimation?.manforceNumber ?? 0,
                          unit: estimation?.manforceType ?? "",
                        },
                        timeEstimation: {
                          value: estimation?.timeEstimation ?? 0,
                          unit: estimation?.timeUnit ?? "",
                        },
                      });
                      await utils.estimations.getProjectEstimations.refetch({
                        projectId,
                      });
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentRecomendationIndex(
                        (prev) =>
                          (prev + 1) %
                          (partialResponse?.estimations.length ?? 1),
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {partialResponse?.estimations[currentRecomendationIndex]?.notes}
              </p>
              <div className="flex w-1/2 items-center justify-center space-y-2">
                <div className="flex w-full">
                  <Button variant="outline">
                    {
                      partialResponse?.estimations[currentRecomendationIndex]
                        ?.timeEstimation
                    }{" "}
                    {
                      partialResponse?.estimations[currentRecomendationIndex]
                        ?.timeUnit
                    }
                  </Button>
                </div>
                <div className="flex w-full flex-wrap space-x-2">
                  <Button variant="outline">
                    {
                      partialResponse?.estimations[currentRecomendationIndex]
                        ?.manforceNumber
                    }{" "}
                    {
                      partialResponse?.estimations[currentRecomendationIndex]
                        ?.manforceType
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
