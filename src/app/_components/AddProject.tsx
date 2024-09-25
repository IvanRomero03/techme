import { Button } from "t/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "t/components/ui/dialog";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "t/components/ui/select";
import { Textarea } from "t/components/ui/textarea";
import { Field, Form, Formik } from "formik";
import { api } from "techme/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "t/components/ui/avatar";
import { readableRole, UserRole } from "../members/columns";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "t/components/ui/popover";
import { XCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "t/components/ui/command";

export function AddProject() {
  const { data: members, isLoading: membersLoading } =
    api.members.getMembers.useQuery();
  const { mutateAsync: createProject } =
    api.projects.createProject.useMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">+ Add Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>+ Add Project</DialogTitle>
          <DialogDescription>
            Create a new project by filling out the form below. You can always
            edit the project details later.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            project_name: "",
            project_description: "",
            project_category: "",
            project_members: [] as string[],
            _selectedMembers: new Map<
              string,
              {
                id: string;
                name: string | null;
                email: string;
                role: string | null;
                emailVerified: Date | null;
                image: string | null;
              }
            >(),
            _openMembers: false,
          }}
          onSubmit={async (values) => {
            console.log("AQUI", values);
            const res = await createProject({
              project_name: values.project_name,
              project_description: values.project_description,
              project_category: values.project_category,
              project_members: Array.from(values._selectedMembers.keys()),
            });
            console.log(res);
            setDialogOpen(false);
          }}
        >
          {({ dirty, errors, values, setFieldValue, submitForm }) => (
            <Form>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-1">
                  <Label htmlFor="project_name" className="text-left">
                    Project Name
                  </Label>
                  <Field
                    id="project_name"
                    name="project_name"
                    as={Input}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-1 items-center gap-1">
                  <Label htmlFor="project_description" className="text-left">
                    Description (optional)
                  </Label>
                  <Field
                    id="project_description"
                    name="project_description"
                    as={Textarea}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-1 items-center gap-1">
                  <Label htmlFor="project_category" className="text-left">
                    Category
                  </Label>
                  <Field
                    id="project_category"
                    name="project_category"
                    as={Input}
                    className="col-span-3"
                  />
                </div>
                <div className="flex-col">
                  <Label htmlFor="project_members" className="text-left">
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
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                              {members?.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={
                                    (member.name ?? "") +
                                    ":" +
                                    member.id +
                                    ":" +
                                    readableRole(member.role as UserRole)
                                  }
                                  onSelect={(v) => {
                                    // console.log("value changed", v);
                                    const [name, id, role] = v.split(":");
                                    if (!id || !name || !role) return;
                                    if (values._selectedMembers.has(id)) {
                                      values._selectedMembers.delete(id);
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
                                    const temp = values._selectedMembers.set(
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
                                    <div className="flex flex-col">
                                      <span>{member.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {readableRole(member.role as UserRole)}
                                      </span>
                                    </div>
                                  </div>
                                  {values._selectedMembers.has(member.id) && (
                                    <Button disabled variant={"ghost"}>
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
                            <AvatarImage src={member.image ?? undefined} />
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
                              const temp = new Map(values._selectedMembers);
                              temp.delete(member.id);
                              void setFieldValue("_selectedMembers", temp);
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
              <DialogFooter>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
