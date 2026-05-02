import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

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

  const getStatusColor = (title: string) => {
    switch (title.toUpperCase()) {
      case 'DRAFT': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'APPLIED': return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
      case 'INTERVIEW': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'OFFER': return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      case 'REJECTED': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-shrink-0 w-[320px] rounded-[2rem] p-4 transition-all duration-300",
        isOver ? "bg-zinc-800/40 ring-1 ring-zinc-700 ring-offset-4 ring-offset-zinc-950 shadow-2xl" : "bg-zinc-900/20"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-4 pt-2">
        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getStatusColor(column.title))} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            {column.title}
          </h3>
        </div>
        <span className="bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-lg">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar min-h-[400px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-40 border-2 border-dashed border-zinc-800/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center group transition-all hover:border-zinc-700 hover:bg-zinc-800/10">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-zinc-600 text-xs">+</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">Awaiting Signals</p>
          </div>
        )}
      </div>
    </div>
  );
}
