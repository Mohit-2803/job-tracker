import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: any[];
}

function SortableCard({ task, onClick }: { task: any, onClick: () => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard app={task} onClick={onClick} />
    </div>
  );
}

export function KanbanColumn({ column, tasks, onCardClick }: KanbanColumnProps & { onCardClick: (app: any) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-shrink-0 w-80 bg-gray-100/50 rounded-2xl p-4 border transition-colors ${
        isOver ? "border-blue-300 bg-blue-50/50" : "border-gray-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-gray-700 tracking-wide">{column.title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[150px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
