"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { cn } from "lib/utils";
import { api } from "techme/trpc/react";
import { useSession } from "next-auth/react";
import { Field, Form, Formik } from "formik";
import { Label } from "t/components/ui/label";
import { Input } from "t/components/ui/input";
import { Textarea } from "t/components/ui/textarea";
import { DatePickerRange } from "techme/app/_components/DatePickerRange";

export default function Page({ params }: { params: { projectId: string } }) {
  const [activeMenuItem, setActiveMenuItem] = useState("Details");
  const { data: proyectDetails, isLoading: isLoadingProyectDetails } =
    api.projects.getProyectInfo.useQuery({
      projectId: Number(params.projectId),
    });
  const session = useSession();
  const utils = api.useUtils();
  const { mutateAsync: updateProject } =
    api.projects.updateProjectDetails.useMutation();

  const menuItems = [
    "Details",
    "Requirements",
    "Planning",
    "Analysis",
    "Estimations",
    "Proposals",
    "Validation",
  ];

  const handleMenuClick = (item: string) => {
    setActiveMenuItem(item);
  };

  if (isLoadingProyectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">
        Project: {proyectDetails?.project.name}
      </h1>
      <div className="flex h-full w-full">
        {/* Sidebar Menu */}
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

        {/* Main Content Area */}
        <div className="mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
          {/* Estimations Section */}
          <h2 className="mb-4 text-2xl font-bold">{activeMenuItem}</h2>
          {activeMenuItem === "Estimations" ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-5">
                {/* Example Phase Cards */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>Phase</CardTitle>
                  </CardHeader>
                  <CardContent className="flex space-x-4">
                    <Button variant="outline">Time Estimation</Button>
                    <Button variant="outline">Manforce</Button>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>Phase</CardTitle>
                  </CardHeader>
                  <CardContent className="flex space-x-4">
                    <Button variant="outline">Time Estimation</Button>
                    <Button variant="outline">Manforce</Button>
                  </CardContent>
                </Card>
              </div>

              {/* New Phase Button */}
              <div className="mb-6 flex">
                <Button variant="default">New Phase</Button>
              </div>

              {/* Total Estimation Section */}
              <h3 className="mb-4 text-xl font-bold">Total Estimation</h3>
              <div className="flex space-x-4">
                <Button variant="outline">Time Estimation</Button>
                <Button variant="outline">Manforce</Button>
              </div>
            </>
          ) : activeMenuItem === "Details" ? (
            <>
              {isLoadingProyectDetails ? (
                <p>Loading...</p>
              ) : (
                <Formik
                  initialValues={{
                    name: proyectDetails?.project.name ?? "",
                    description: proyectDetails?.project.description ?? "",
                    stage: proyectDetails?.project.stage ?? "",
                    status: proyectDetails?.project.status ?? "",
                    category: proyectDetails?.project.category ?? "",
                    startDate: proyectDetails?.project.startDate ?? "",
                    endDate: proyectDetails?.project.endDate ?? "",
                    completionPercentage:
                      proyectDetails?.project.completionPercentage ?? "",
                    members:
                      proyectDetails?.members?.map((mem) => mem.user) ?? [],
                  }}
                  onSubmit={async (values) => {
                    console.log(values);
                    if (!proyectDetails?.project.id) {
                      return;
                    }
                    await updateProject({
                      project_id: proyectDetails?.project.id,
                      project_category: values.category,
                      project_description: values.description,
                      project_members: values.members.map((mem) => mem.id),
                      project_name: values.name,
                      project_stage: values.stage,
                      project_status: values.status,
                    });
                    await utils.projects.getProyectInfo.invalidate();
                  }}
                >
                  <Form>
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Field
                          id="name"
                          name="name"
                          as={Input}
                          type="text"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Field
                          id="description"
                          name="description"
                          type="text"
                          as={Textarea}
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="stage">Stage</Label>
                        <Field
                          id="stage"
                          name="stage"
                          as={Input}
                          type="text"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Field
                          id="status"
                          name="status"
                          as={Input}
                          type="text"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Field
                          id="category"
                          name="category"
                          as={Input}
                          type="text"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="startDate">Dates</Label>
                        <DatePickerRange
                          startDate={
                            proyectDetails?.project.startDate as
                              | Date
                              | undefined
                          }
                          endDate={
                            proyectDetails?.project.endDate as Date | undefined
                          }
                        />
                      </div>
                      <Button type="submit">Save</Button>
                    </div>
                  </Form>
                </Formik>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
