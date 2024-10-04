"use client";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

import { api } from "techme/trpc/react";
import Container from "./Container";
import { Item } from "./SortableItem";

export interface Task {
  id: number;
  description: string;
  userId: string | null;
  status: string;
  projectId: number | null;
  title: string;
  priority: number | null;
  createdAt: Date | null;
  lastModifiedBy: string | null;
}

export default function KanBan({ projectId }: { projectId: number }) {
  const { data: tasks, isFetching: fetchingTasks } =
    api.prjectTasks.getProjectTasks.useQuery({ projectId });
  const { mutateAsync: updateTaskStatus } =
    api.prjectTasks.updateTaskStatus.useMutation();
  const utils = api.useUtils();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(tasks);

  const activeItem =
    items &&
    Object.values(items)
      .reduce((acc, items) => acc.concat(items), [])
      .find((item) => item.id === Number(activeId));

  useEffect(() => {
    // console.log("tasks", tasks);
    setItems(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 5,
      },
    }),
  );

  return (
    <div className="grid h-full grid-cols-3 gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Container id="todo" items={items?.todo ?? []} />
        <Container id="in-progress" items={items ? items["in-progress"] : []} />
        <Container id="done" items={items?.done ?? []} />
        <DragOverlay>
          {activeItem ? <Item task={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: string) {
    if (!items) {
      return null;
    }
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key as keyof typeof items].find((item) => item.id === Number(id))
        ? true
        : false,
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!items) {
      return;
    }
    const id = active?.id as string;
    const overId = over?.id as string;

    if (!active || !over) {
      return;
    }
    const activeItem = Object.values(items)
      .reduce((acc, items) => acc.concat(items), [])
      .find((item) => item.id === Number(id));
    if (!activeItem) {
      return;
    }

    const activeContainer = findContainer(id) as keyof typeof items;
    const overContainer = findContainer(overId) as keyof typeof items;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      if (!prev) {
        prev = {
          todo: [],
          "in-progress": [],
          done: [],
        };
      }
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex(
        (item) => item.id === Number(id),
      );
      const overIndex = overItems.findIndex(
        (item) => item.id === Number(overId),
      );

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          (active.rect.current.translated?.top ?? 0) >
            over.rect.top + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(
            (item) => item.id !== Number(active.id),
          ),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!items) {
      return;
    }
    const id = active?.id as string;
    const overId = over?.id as string;

    const activeContainer = findContainer(id) as keyof typeof items;
    const overContainer = findContainer(overId) as keyof typeof items;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(
      (item) => item.id === Number(active.id),
    );
    const overIndex = items[overContainer].findIndex(
      (item) => item.id === Number(overId),
    );

    if (activeIndex !== overIndex) {
      setItems((items) => {
        if (!items) {
          return items;
        }

        const activeItems = items[activeContainer];
        const overItems = items[overContainer];

        const newItems = {
          ...items,
          [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
        };

        return newItems;
      });
    }

    if (activeItem?.status === overContainer) {
      return;
    }
    await updateTaskStatus({
      id: Number(id),
      projectId,
      status: overContainer,
    });
    await utils.prjectTasks.getProjectTasks.refetch({ projectId });
    setActiveId(null);
  }
}
