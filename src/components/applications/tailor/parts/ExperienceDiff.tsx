"use client";

import { ArrowRight } from "lucide-react";
import type { ParsedTailoredResume } from "@/lib/ai/schema";
import type { EntryDecision } from "../tailorReducer";
import { AcceptRejectButtons, DecisionPill, DiffPane } from "./DiffPrimitives";

export function ExperienceDiff({
  entry,
  decision,
  onAccept,
  onReject,
}: {
  entry: ParsedTailoredResume["experience"][number];
  decision: EntryDecision;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight truncate">
              {entry.role}
            </h4>
            <p className="text-xs text-zinc-400">
              {entry.company}
              {entry.startDate ? ` · ${entry.startDate}` : ""}
              {entry.endDate ? ` – ${entry.endDate}` : ""}
            </p>
          </div>
          <DecisionPill decision={decision} />
          {!entry.changed && (
            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
              Unchanged
            </span>
          )}
        </div>
        <AcceptRejectButtons
          decision={decision}
          onAccept={onAccept}
          onReject={onReject}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiffPane label="Original" body={entry.originalDescription} muted />
        <DiffPane
          label="AI Rewritten"
          body={entry.tailoredDescription}
          highlighted={entry.changed}
        />
      </div>

      {entry.rationale && entry.changed && (
        // items-start + matched line-height keeps the arrow aligned with the first line of text
        // even if the rationale wraps. mt-0.75 is the tiny optical nudge to center the icon
        // on the cap-height of "Why:" — text-xs leading-relaxed = 12px / ~19px line.
        <div className="mt-4 flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl px-4 py-3">
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.75" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-indigo-300">Why: </span>
            {entry.rationale}
          </p>
        </div>
      )}
    </div>
  );
}
