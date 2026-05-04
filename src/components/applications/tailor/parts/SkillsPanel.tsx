"use client";

import { Sparkles } from "lucide-react";

export function SkillsPanel({
  skillsOrder,
  emphasized,
}: {
  skillsOrder: string[];
  emphasized: string[];
}) {
  const emphasizedSet = new Set(emphasized);
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
        Skills (Reordered)
      </h3>
      <div className="flex flex-wrap gap-2">
        {skillsOrder.map((skill) => {
          const isHot = emphasizedSet.has(skill);
          return (
            <span
              key={skill}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${
                isHot
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                  : "bg-zinc-950/40 border-zinc-800 text-zinc-400"
              }`}
            >
              {isHot && <Sparkles className="w-3 h-3 mr-1.5" />}
              {skill}
            </span>
          );
        })}
      </div>
    </div>
  );
}
