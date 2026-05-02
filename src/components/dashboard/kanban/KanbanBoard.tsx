"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AppStatus } from "@prisma/client";
import { KanbanCard } from "./KanbanCard";
import { updateApplicationStatus } from "@/app/actions/application";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { useRouter } from "next/navigation";

type ApplicationWithCompany = any; // simplified for now

const COLUMNS = [
  { id: AppStatus.PENDING, title: "Pending AI Analysis" },
  { id: AppStatus.DRAFT, title: "Draft" },
  { id: AppStatus.APPLIED, title: "Applied" },
  { id: AppStatus.INTERVIEW, title: "Interview" },
  { id: AppStatus.OFFER, title: "Offer" },
  { id: AppStatus.REJECTED, title: "Rejected" },
];

export function KanbanBoard({ initialApplications }: { initialApplications: ApplicationWithCompany[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Sync state when props change (for polling updates)
  React.useEffect(() => {
    setItems(initialApplications);
  }, [initialApplications]);

  // Real-time Polling: if any application is PENDING, refresh the server component every 5 seconds
  React.useEffect(() => {
    const hasPending = items.some(app => app.status === AppStatus.PENDING);
    if (hasPending) {
      const interval = setInterval(() => {
        router.refresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [items, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setItems((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      setItems((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].status = overId as AppStatus;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeTask = items.find((t) => t.id === activeId);
    
    if (!activeTask) return;

    // Check if status changed
    const targetStatus = over.data.current?.type === "Column" 
      ? over.id 
      : over.data.current?.task?.status;

    if (targetStatus && activeTask.status !== targetStatus) {
      // Optimistic UI update handled in DragOver
      try {
        await updateApplicationStatus(activeId, targetStatus as AppStatus);
        toast.success(`Moved to ${targetStatus}`);
      } catch (error) {
        toast.error("Failed to move application");
        // We could revert the state here in a real app
      }
    }
  };

  const activeTask = items.find((task) => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-8 h-[calc(100vh-180px)]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={items.filter((item) => item.status === col.id)}
            onCardClick={(app) => setSelectedApp(app)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard app={activeTask} /> : null}
      </DragOverlay>
      
      <ApplicationDrawer
        isOpen={!!selectedApp}
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </DndContext>
  );
}
