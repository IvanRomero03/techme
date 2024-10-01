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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "t/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "t/components/ui/command";
import { readableRole } from "techme/app/members/columns";
import type { UserRole } from "techme/util/UserRole";
import { Avatar, AvatarFallback, AvatarImage } from "t/components/ui/avatar";
import { XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "t/components/ui/select";
import {
  ProjectStatus,
  ProjectStage,
  readableProjectStage,
  readableProjectStatus,
} from "techme/util/Readables";
import Markdown from "react-markdown";

const menuItems = [
  "Summary",
  "Details",
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
  const session = useSession();
  const utils = api.useUtils();
  const { mutateAsync: updateProject } =
    api.projects.updateProjectDetails.useMutation();

  const { data: members, isLoading: membersLoading } =
    api.members.getAuthorizedMembers.useQuery();

  const {
    data: summary,
    isFetching: fetchingStatus,
    status: summaryStatus,
  } = api.projectsSummary.getProjectSummary.useQuery({
    projectId: Number(params.projectId),
  });

  // console.log("summary", summary);

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
                      proyectDetails?.project.completionPercentage ?? 0,
                    members:
                      proyectDetails?.members?.map((mem) => mem.user) ?? [],
                    _openMembers: false,
                    _selectedMembers: new Map<
                      string,
                      {
                        id: string;
                        name: string | null;
                        email: string;
                        role: string | null;
                        image: string | null;
                      }
                    >(
                      proyectDetails?.members?.map((mem) => [
                        mem.user.id,
                        mem.user,
                      ]) ?? [],
                    ),
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
                      project_members: Array.from(
                        values._selectedMembers.keys(),
                      ),
                      project_name: values.name,
                      project_stage: values.stage,
                      project_status: values.status,
                      project_percentage: values.completionPercentage,
                    });
                    await utils.projects.getProyectInfo.invalidate();
                  }}
                >
                  {({ values, setFieldValue }) => (
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
                          <Select
                            value={values.stage}
                            onValueChange={(v) => {
                              void setFieldValue("stage", v);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue
                                className="w-full rounded-md border p-2"
                                placeholder="Select a stage"
                              >
                                {readableProjectStage(
                                  values.stage as ProjectStage,
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ProjectStage).map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                  {readableProjectStage(stage as ProjectStage)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex w-full flex-col gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={values.status}
                            onValueChange={(v) => {
                              void setFieldValue("status", v);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue
                                className="w-full rounded-md border p-2"
                                placeholder="Select a status"
                              >
                                {readableProjectStatus(
                                  values.status as ProjectStatus,
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ProjectStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {readableProjectStatus(
                                    status as ProjectStatus,
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              proyectDetails?.project.endDate as
                                | Date
                                | undefined
                            }
                          />
                        </div>
                        <div className="flex w-full flex-col gap-2">
                          <Label htmlFor="completionPercentage">
                            Completion Percentage
                          </Label>
                          <Field
                            id="completionPercentage"
                            name="completionPercentage"
                            as={Input}
                            type="number"
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <div className="flex w-full flex-wrap gap-2">
                          <div className="flex-col">
                            <Label
                              htmlFor="project_members"
                              className="text-left"
                            >
                              Members
                            </Label>
                            {membersLoading ? (
                              <div>Loading...</div>
                            ) : (
                              <Popover
                                open={values._openMembers}
                                onOpenChange={(open) => {
                                  void setFieldValue("_openMembers", open);
                                }}
                              >
                                <PopoverTrigger>
                                  <Button
                                    onClick={() => {
                                      void setFieldValue("_openMembers", true);
                                    }}
                                    variant="outline"
                                    className=""
                                    id="project_members"
                                    type="button"
                                  >
                                    Add Members
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0"
                                  side={"right"}
                                  align="start"
                                >
                                  <Command className="">
                                    <CommandInput placeholder="Add a member to the project" />
                                    <CommandList>
                                      <CommandEmpty>
                                        No results found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {members?.map((member) => (
                                          <CommandItem
                                            key={member.id}
                                            value={
                                              (member.name ?? "") +
                                              ":" +
                                              member.id +
                                              ":" +
                                              readableRole(
                                                member.role as UserRole,
                                              )
                                            }
                                            onSelect={(v) => {
                                              // console.log("value changed", v);
                                              const [name, id, role] =
                                                v.split(":");
                                              if (!id || !name || !role) return;
                                              if (
                                                values._selectedMembers.has(id)
                                              ) {
                                                values._selectedMembers.delete(
                                                  id,
                                                );
                                                void setFieldValue(
                                                  "_selectedMembers",
                                                  values._selectedMembers,
                                                );
                                                return;
                                              }
                                              const member = members?.find(
                                                (m) => m.id === id,
                                              );
                                              if (!member) return;
                                              const temp =
                                                values._selectedMembers.set(
                                                  id,
                                                  member,
                                                );
                                              void setFieldValue(
                                                "_selectedMembers",
                                                temp,
                                              );
                                            }}
                                          >
                                            <div className="flex items-center gap-x-4">
                                              <Avatar>
                                                <AvatarImage
                                                  src={
                                                    member.image ?? undefined
                                                  }
                                                />
                                                <AvatarFallback>
                                                  {member.name !== undefined &&
                                                  member.name !== null &&
                                                  member.name.split(" ")
                                                    .length > 1 &&
                                                  member.name.length > 1
                                                    ? member.name[0]!.toUpperCase() +
                                                      (member.name.split(" ")[1]
                                                        ? member.name
                                                            .split(" ")[1]![0]
                                                            ?.toUpperCase()
                                                        : "")
                                                    : "Ukw"}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex flex-col">
                                                <span>{member.name}</span>
                                                <span className="text-xs text-gray-500">
                                                  {readableRole(
                                                    member.role as UserRole,
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                            {values._selectedMembers.has(
                                              member.id,
                                            ) && (
                                              <Button
                                                disabled
                                                variant={"ghost"}
                                                type="button"
                                              >
                                                <XCircle className="h-4 w-4 text-red-500" />
                                              </Button>
                                            )}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            )}
                            <div className="m-8 flex flex-wrap gap-4">
                              {Array.from(values._selectedMembers.values()).map(
                                (member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={member.image ?? undefined}
                                      />
                                      <AvatarFallback>
                                        {member.name !== undefined &&
                                        member.name !== null &&
                                        member.name.split(" ").length > 1 &&
                                        member.name.length > 1
                                          ? member.name[0]!.toUpperCase() +
                                            (member.name.split(" ")[1]
                                              ? member.name
                                                  .split(" ")[1]![0]
                                                  ?.toUpperCase()
                                              : "")
                                          : "Ukw"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p>{member.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {readableRole(member.role as UserRole)}
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => {
                                        const temp = new Map(
                                          values._selectedMembers,
                                        );
                                        temp.delete(member.id);
                                        void setFieldValue(
                                          "_selectedMembers",
                                          temp,
                                        );
                                      }}
                                      variant={"ghost"}
                                    >
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Save
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </>
          ) : activeMenuItem === "Summary" ? (
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
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
