"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  FileSearch,
  Target,
  PenLine,
  GitMerge,
} from "lucide-react";

type Step = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  { label: "Reading the job description", Icon: FileSearch },
  { label: "Mapping your skills against requirements", Icon: Target },
  { label: "Rewriting your summary", Icon: PenLine },
  { label: "Reframing experience bullets", Icon: Sparkles },
  { label: "Finalizing the diff for review", Icon: GitMerge },
];

const STEP_INTERVAL_MS = 750;

export function RewriteLoadingPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
          AI is working
        </p>
      </div>

      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const state =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
          return <StepRow key={step.label} step={step} state={state} />;
        })}
      </ul>

      <p className="text-[10px] text-zinc-500 mt-6 leading-relaxed">
        Your original resume is never modified. You&apos;ll review every change
        before saving.
      </p>
    </div>
  );
}

function StepRow({
  step,
  state,
}: {
  step: Step;
  state: "pending" | "active" | "done";
}) {
  const { Icon, label } = step;

  // Three visually distinct states. Done = emerald check. Active = indigo
  // pulsing icon + crisp text. Pending = grey, muted, no animation.
  return (
    <li className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
          state === "done"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : state === "active"
              ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 animate-pulse"
              : "bg-zinc-950/40 border-zinc-800 text-zinc-700"
        }`}
      >
        {state === "done" ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Icon className="w-3.5 h-3.5" />
        )}
      </div>
      <span
        className={`text-sm transition-colors ${
          state === "done"
            ? "text-zinc-500"
            : state === "active"
              ? "text-white font-medium"
              : "text-zinc-600"
        }`}
      >
        {label}
      </span>
    </li>
  );
}
