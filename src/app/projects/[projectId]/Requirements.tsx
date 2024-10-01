"use client";

import { Field, Form, Formik, FieldArray } from "formik";
import { Button } from "t/components/ui/button";
import { Label } from "t/components/ui/label";
import { Textarea } from "t/components/ui/textarea";
import { Input } from "t/components/ui/input";
<<<<<<< HEAD
import { api } from "techme/trpc/react";
=======
import { api } from "techme/trpc/react"; 
>>>>>>> refs/remotes/origin/EstebanAleman21/feature/requirements
import React, { useState } from "react";
import { useSession } from "next-auth/react";

interface Requirement {
  id?: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: number;
  lastModifiedBy: string;
}

interface RequirementsProps {
  projectId: number;
}

const Requirements: React.FC<RequirementsProps> = ({ projectId }) => {
  const {
    data: requirements,
    isLoading,
    isError,
  } = api.requirements.getAllRequirements.useQuery({ projectId });

  const utils = api.useUtils();

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { mutateAsync: addRequirement } =
    api.requirements.createRequirement.useMutation({
      onSuccess: () => utils.requirements.getAllRequirements.invalidate(),
    });

  const { mutateAsync: updateRequirement } =
    api.requirements.updateRequirement.useMutation({
      onSuccess: () => utils.requirements.getAllRequirements.invalidate(),
    });

  const { mutateAsync: deleteRequirement } =
    api.requirements.deleteRequirement.useMutation({
      onSuccess: () => utils.requirements.getAllRequirements.invalidate(),
    });

  const handleAddRequirement = async (requirement: Requirement) => {
    await addRequirement({
      projectId: projectId,
      title: requirement.title,
      description: requirement.description,
      status: requirement.status,
      priority: requirement.priority,
      lastModifiedBy: userId ?? "",
    });
  };

  const handleUpdateRequirement = async (requirement: Requirement) => {
    if (!requirement.id) return;

    await updateRequirement({
      id: requirement.id,
      title: requirement.title,
      projectId: projectId,
      description: requirement.description,
      status: requirement.status,
      priority: requirement.priority,
      lastModifiedBy: requirement.lastModifiedBy ?? userId ?? "",
    });
  };

  const handleDeleteRequirement = async (id: number) => {
    await deleteRequirement({ id });
  };

  const [editIndex, setEditIndex] = useState<number | null>(null);

  return (
    <>
      {/* Form to create a new requirement */}
      <Formik
        initialValues={{
          requirements: [
            {
              title: "",
              description: "",
              status: "active",
              priority: 0,
              lastModifiedBy: "",
            },
          ] as Requirement[],
        }}
        onSubmit={async (values, { resetForm }) => {
          await Promise.all(
            values.requirements.map((requirement) =>
              handleAddRequirement(requirement),
            ),
          );
          resetForm();
        }}
      >
        {({ values }) => (
          <Form className="mb-4">
            <FieldArray name="requirements">
              {(arrayHelpers) => (
                <div>
                  {values.requirements.map((_, index) => (
                    <div
                      key={index}
                      className="mb-4 flex flex-col gap-2 rounded-md border p-4"
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`requirements.${index}.title`}>
                          Title
                        </Label>
                        <Field
                          name={`requirements.${index}.title`}
                          as={Input}
                          type="text"
                          placeholder="Enter a title"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`requirements.${index}.description`}>
                          Description
                        </Label>
                        <Field
                          name={`requirements.${index}.description`}
                          as={Textarea}
                          placeholder="Enter a description"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`requirements.${index}.status`}>
                          Status
                        </Label>
                        <Field
                          name={`requirements.${index}.status`}
                          as={Input}
                          type="text"
                          placeholder="Enter a status"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`requirements.${index}.priority`}>
                          Priority
                        </Label>
                        <Field
                          name={`requirements.${index}.priority`}
                          as={Input}
                          type="number"
                          placeholder="Enter a priority"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                        className="mt-2"
                      >
                        Remove Requirement
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      arrayHelpers.push({
                        title: "",
                        description: "",
                        status: "active",
                        priority: 0,
                        lastModifiedBy: userId ?? "",
                      })
                    }
                    className="mt-4"
                  >
                    Add Another Requirement
                  </Button>
                </div>
              )}
            </FieldArray>
            <Button type="submit" className="mt-4">
              Submit Requirements
            </Button>
          </Form>
        )}
      </Formik>

      {/* Display existing requirements and update/delete options */}
      <h2 className="mt-8 text-xl font-bold">Existing Requirements</h2>
      {isLoading ? (
        <p>Loading requirements...</p>
      ) : isError ? (
        <p>Error loading requirements.</p>
      ) : (
        <div>
          {requirements?.map((requirement, index) => (
            <div
              key={requirement.id}
              className="mb-4 flex flex-col gap-2 rounded-md border p-4"
            >
              {editIndex === index ? (
                <>
                  {/* Form for editing the requirement */}
                  <Formik
                    initialValues={{
                      title: requirement.title || "",
                      description: requirement.description ?? "",
                      status: requirement.status ?? "active",
                      priority: requirement.priority ?? 0,
                    }}
                    onSubmit={async (values) => {
                      await handleUpdateRequirement({
                        ...requirement,
                        ...values,
                        projectId,
                        lastModifiedBy: userId ?? "",
                      });
                      setEditIndex(null);
                    }}
                  >
                    {() => (
                      <Form>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Field
                            id={`title-${index}`}
                            name="title"
                            as={Input}
                            type="text"
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`description-${index}`}>
                            Description
                          </Label>
                          <Field
                            id={`description-${index}`}
                            name="description"
                            as={Textarea}
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`status-${index}`}>Status</Label>
                          <Field
                            id={`status-${index}`}
                            name="status"
                            as={Input}
                            type="text"
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`priority-${index}`}>Priority</Label>
                          <Field
                            id={`priority-${index}`}
                            name="priority"
                            as={Input}
                            type="number"
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <Button type="submit" className="mx-4 mt-4">
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setEditIndex(null)}
                          className="mt-4"
                        >
                          Cancel
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{requirement.title}</h3>
                      <p>{requirement.description}</p>
                      <p>Status: {requirement.status}</p>
                      <p>Priority: {requirement.priority}</p>
                    </div>
                    <div className="space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditIndex(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteRequirement(requirement.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Requirements;
