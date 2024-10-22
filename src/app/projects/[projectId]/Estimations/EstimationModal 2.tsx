import { Formik, Form, Field } from "formik";
import { useState } from "react";
import { Button } from "t/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "t/components/ui/dialog";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "t/components/ui/select";
import { Textarea } from "t/components/ui/textarea";
import { api } from "techme/trpc/react";

interface EstimationProp {
  id: number;
  proyectId: number;
  phase: string;
  timeEstimation: {
    value: number;
    unit: string;
  };
  manforce: {
    value: number;
    unit: string;
  };
  notes: string;
}

export default function EstimationModal({
  proyectId,
  newEstimation,
  estimation,
}: {
  proyectId: number;
  newEstimation: boolean;
  estimation?: EstimationProp;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createEstimation } =
    api.estimations.createEstimation.useMutation();
  const { mutateAsync: updateEstimation } =
    api.estimations.updateEstimation.useMutation();
  const utils = api.useUtils();
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <DialogTrigger>
        {newEstimation ? (
          <Button variant="outline" className="absolute right-0 top-0 m-10">
            New Estimation
          </Button>
        ) : (
          <Button variant="outline">Edit</Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-h-[550px]">
        <DialogHeader>
          <h2 className="text-lg font-bold">
            {newEstimation ? "New Estimation" : "Edit Estimation"}
          </h2>
          <DialogDescription>
            {newEstimation
              ? "Create a new estimation for the project"
              : "Edit the estimation for the project"}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            phase: estimation?.phase ?? "",
            timeEstimationValue: estimation?.timeEstimation.value ?? 0,
            timeEstimationUnit: estimation?.timeEstimation.unit ?? "days",
            manforceValue: estimation?.manforce.value ?? 0,
            manforceUnit: estimation?.manforce.unit ?? "",
            notes: estimation?.notes ?? "",
          }}
          onSubmit={async (values) => {
            console.log(values);
            if (!newEstimation && estimation) {
              await updateEstimation({
                ...values,
                projectId: proyectId,
                id: estimation.id,
                manforce: {
                  value: values.manforceValue,
                  unit: values.manforceUnit,
                },
                timeEstimation: {
                  value: values.timeEstimationValue,
                  unit: values.timeEstimationUnit,
                },
                notes: values.notes,
              });
              await utils.estimations.getProjectEstimations.refetch({
                projectId: proyectId,
              });
              setOpen(false);
              return;
            } else {
              await createEstimation({
                projectId: proyectId,
                phase: values.phase,
                timeEstimation: {
                  value: values.timeEstimationValue,
                  unit: values.timeEstimationUnit,
                },
                manforce: {
                  value: values.manforceValue,
                  unit: values.manforceUnit,
                },
                notes: values.notes,
              });
            }
            await utils.estimations.getProjectEstimations.refetch({
              projectId: proyectId,
            });
            setOpen(false);
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div>
                <Label htmlFor="phase">Phase</Label>
                <Field id="phase" name="phase" as={Input} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeEstimationValue">Time Estimation</Label>
                  <Field
                    id="timeEstimationValue"
                    name="timeEstimationValue"
                    as={Input}
                    type="number"
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="timeEstimationUnit">Unit</Label>
                  <Select
                    value={values.timeEstimationUnit}
                    onValueChange={(value) => {
                      void setFieldValue("timeEstimationUnit", value);
                    }}
                  >
                    <SelectTrigger>{values.timeEstimationUnit}</SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["days", "weeks", "months", "years"].map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manforceValue">Manforce</Label>
                  <Field
                    id="manforceValue"
                    name="manforceValue"
                    as={Input}
                    type="number"
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="manforceUnit">Unit</Label>
                  <Field id="manforceUnit" name="manforceUnit" as={Input} />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Field id="notes" name="notes" as={Textarea} />
              </div>
              <div className="m-4 flex w-full justify-end gap-2 p-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {newEstimation ? "Create" : "Update"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
