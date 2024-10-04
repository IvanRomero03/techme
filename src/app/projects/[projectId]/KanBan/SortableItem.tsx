import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "./KanBan";
import TaskModal from "../TaskModal";
import { Badge } from "t/components/ui/badge";

export function Item({ task }: { task: Task }) {
  return (
    <div className="m-2 flex flex-col rounded border border-gray-200 bg-white p-4 shadow">
      <div className="flex w-full items-center justify-between">
        {task.title}
        {task.projectId && (
          <TaskModal task={task} proyectId={task.projectId} newTask={false} />
        )}
      </div>
      <div className="text-sm">{task.description}</div>
      <div className="flex justify-between">
        <Badge
          variant={"outline"}
          className={
            // from 0 to 10 1 green and 10 red
            task.priority === null || task.priority === 0
              ? "bg-gray-200"
              : task.priority <= 3
                ? "bg-green-200"
                : task.priority <= 5
                  ? "bg-yellow-200"
                  : task.priority <= 7
                    ? "bg-orange-200"
                    : "bg-red-200"
          }
        >
          Priority: {task.priority}
        </Badge>
        <div className="text-sm">Status: {task.status}</div>
      </div>
    </div>
  );
}

export default function SortableItem({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        console.log("clicked", task);
      }}
    >
      <Item task={task} />
    </div>
  );
}
