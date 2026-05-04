"use client";

import { AlertTriangle } from "lucide-react";

export function WarningsPanel({ warnings }: { warnings: string[] }) {
  return (
    <div className="bg-amber-500/5 border border-red-400/60 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Honest Gaps Flagged
        </p>
      </div>
      <ul className="space-y-2.5">
        {warnings.map((w, i) => (
          // items-start + a fixed-size div bullet (instead of a text "•") avoids baseline drift
          // when warning text wraps to multiple lines. The mt-2 + h-1.5 align the bullet with
          // the first line's cap-height regardless of total line count.
          <li key={i} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 mt-2 bg-amber-500 rounded-full shrink-0" />
            <span className="text-sm text-zinc-300 leading-relaxed">{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
