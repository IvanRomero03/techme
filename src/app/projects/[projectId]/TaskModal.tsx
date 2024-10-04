import { Field, Form, Formik } from "formik";
import { useState } from "react";
import { Button } from "t/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { api } from "techme/trpc/react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import type { Task } from "./KanBan/KanBan";
import { LoaderCircle } from "lucide-react";

export default function TaskModal({
  proyectId,
  newTask,
  task,
}: {
  proyectId: number;
  newTask: boolean;
  task?: Task;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createTask } = api.prjectTasks.createTask.useMutation();
  const { mutateAsync: updateTask } = api.prjectTasks.updateTask.useMutation();
  const utils = api.useUtils();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {newTask ? (
          <Button variant="outline">New Task</Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setOpen(true);
            }}
          >
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-h-[550px]">
        <Formik
          initialValues={{
            title: task?.title ?? "",
            description: task?.description ?? "",
            status: task?.status ?? "todo",
            priority: task?.priority ?? 0,
          }}
          onSubmit={async (values) => {
            if (!newTask && task) {
              await updateTask({
                ...values,
                projectId: proyectId,
                id: task.id,
                status: values.status as "todo" | "in-progress" | "done",
              });
              await utils.prjectTasks.getProjectTasks.refetch({
                projectId: proyectId,
              });
              setOpen(false);
              return;
            }
            await createTask({
              ...values,
              projectId: proyectId,
              status: values.status as "todo" | "in-progress" | "done",
            });
            await utils.prjectTasks.getProjectTasks.refetch({
              projectId: proyectId,
            });
            setOpen(false);
          }}
          validationSchema={toFormikValidationSchema(
            z.object({
              title: z.string().min(1),
              description: z.string().optional(),
              status: z.enum(["todo", "in-progress", "done"]),
              priority: z.number().int().min(0).max(10),
            }),
          )}
        >
          {({ dirty, errors, setFieldValue, values, isSubmitting }) => (
            <Form>
              <DialogHeader>
                <DialogTitle>
                  {newTask ? "Create a new task" : "Edit task"}
                </DialogTitle>
                <DialogDescription>
                  {newTask
                    ? "Create a new task to be added to the project"
                    : "Edit the task information"}
                </DialogDescription>
              </DialogHeader>
              <div className="m-4 flex flex-col gap-4">
                <Label htmlFor="title">Title</Label>
                <Field id="title" name="title" as={Input} required />
                {errors.title && <p className="text-red-500">{errors.title}</p>}
                <Label htmlFor="description">Description</Label>
                <Field id="description" name="description" as={Textarea} />
                <Label htmlFor="status">Status</Label>
                {errors.status && (
                  <p className="text-red-500">{errors.status}</p>
                )}
                <Select
                  name="status"
                  value={values.status}
                  onValueChange={(val) => setFieldValue("status", val)}
                  required
                >
                  <SelectTrigger>
                    {values.status === "todo"
                      ? "To Do"
                      : values.status === "in-progress"
                        ? "In Progress"
                        : "Done"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500">{errors.status}</p>
                )}
                <Label htmlFor="priority">Priority</Label>
                <Field
                  id="priority"
                  name="priority"
                  as={Input}
                  type="number"
                  min="0"
                  max="10"
                  required
                />
                {errors.priority && (
                  <p className="text-red-500">{errors.priority}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !dirty || Object.keys(errors).length > 0 || isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : null}
                  {newTask ? "Create Task" : "Update Task"}
                </Button>
                <DialogClose>
                  <Button variant="default">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
