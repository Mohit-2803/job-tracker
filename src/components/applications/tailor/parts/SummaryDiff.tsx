"use client";

import type { EntryDecision } from "../tailorReducer";
import { AcceptRejectButtons, DecisionPill, DiffPane } from "./DiffPrimitives";

export function SummaryDiff({
  originalSummary,
  tailoredSummary,
  decision,
  onAccept,
  onReject,
}: {
  originalSummary: string;
  tailoredSummary: string;
  decision: EntryDecision;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Summary
          </h3>
          <DecisionPill decision={decision} />
        </div>
        <AcceptRejectButtons
          decision={decision}
          onAccept={onAccept}
          onReject={onReject}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiffPane label="Original" body={originalSummary || "(none)"} muted />
        <DiffPane label="AI Rewritten" body={tailoredSummary} highlighted />
      </div>
    </div>
  );
}
