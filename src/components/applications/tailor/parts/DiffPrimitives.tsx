"use client";

import { Check, X } from "lucide-react";
import type { EntryDecision } from "../tailorReducer";

// Small reusable diff-UI bits that don't earn their own files individually.

export function DecisionPill({ decision }: { decision: EntryDecision }) {
  const styles = {
    pending: "bg-zinc-800 text-zinc-400 border-zinc-700",
    accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const label = decision[0].toUpperCase() + decision.slice(1);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${styles[decision]}`}
    >
      {label}
    </span>
  );
}

export function AcceptRejectButtons({
  onAccept,
  onReject,
  decision,
}: {
  onAccept: () => void;
  onReject: () => void;
  decision: EntryDecision;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAccept}
        className={`p-2 rounded-lg border transition-all ${
          decision === "accepted"
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400"
        }`}
        title="Accept tailored version"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onReject}
        className={`p-2 rounded-lg border transition-all ${
          decision === "rejected"
            ? "bg-red-500/15 border-red-500/40 text-red-400"
            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-500/30 hover:text-red-400"
        }`}
        title="Keep original"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function DiffPane({
  label,
  body,
  muted,
  highlighted,
}: {
  label: string;
  body: string;
  muted?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlighted
          ? "bg-indigo-500/5 border-indigo-500/20"
          : "bg-zinc-950/40 border-zinc-800/60"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-2 ${
          // CSS `uppercase` transforms display only — the JS string is still "Original" / "AI Rewritten".
          // Compare against the actual prop value, not the rendered look.
          label === "Original" ? "text-zinc-400" : "text-purple-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm leading-relaxed whitespace-pre-wrap ${
          muted ? "text-zinc-400" : "text-zinc-100"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
