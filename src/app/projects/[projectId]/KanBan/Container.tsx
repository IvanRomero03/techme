import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem";
import type { Task } from "./KanBan";

export default function Container({
  id,
  items,
}: {
  id: string;
  items: Task[];
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="flex-1 gap-4 rounded-lg border-2 border-dotted"
      >
        <div className="m-4 flex items-center justify-center align-middle">
          <h2 className="text-lg font-bold">
            {id === "todo"
              ? "To Do"
              : id === "in-progress"
                ? "In Progress"
                : "Done"}
          </h2>
        </div>
        {items.map((task) => (
          <SortableItem key={task.id} task={task} />
        ))}
      </div>
    </SortableContext>
  );
}
