"use client";

import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import EstimationModal from "./Estimations/EstimationModal";
import { api } from "techme/trpc/react";
import { Label } from "t/components/ui/label";

export default function Estimations({ projectId }: { projectId: number }) {
  const { data: estimations, isLoading } =
    api.estimations.getProjectEstimations.useQuery({
      projectId,
    });
  const { mutateAsync: deleteEstimation } =
    api.estimations.deleteEstimation.useMutation();
  const utils = api.useUtils();
  return (
    <>
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
    </>
  );
}
