"use client";

import { useReducer, useMemo, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Target,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useTailor } from "./useTailor";
import {
  tailorReducer,
  deriveTailorState,
  experienceKey,
  type TailorState,
  type EntryDecision,
  type CommittedTailoredResume,
} from "./tailorReducer";
import type { ParsedTailoredResume } from "@/lib/ai/schema";
import { getCompanyLogo } from "@/lib/logos";

type Props = {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  extractedSkillsCount: number;
  matchScore: number | null;
  resumeId: string | null;
  resumeTitle: string | null;
  initialTailored: ParsedTailoredResume | null;
  tailoredAt: Date | null;
  initialCommitted: CommittedTailoredResume | null;
  initialCommittedAt: Date | null;
};

const EMPTY_STATE: TailorState = { summary: "pending", experience: {} };

export function TailorStudio({
  applicationId,
  jobTitle,
  companyName,
  extractedSkillsCount,
  matchScore,
  resumeTitle,
  initialTailored,
  tailoredAt,
  initialCommitted,
  initialCommittedAt,
}: Props) {
  const {
    tailored,
    status,
    error,
    runTailor,
    saveStatus,
    saveError,
    committedAt,
    commit,
  } = useTailor(applicationId, initialTailored, initialCommittedAt);

  // Logo URL has a primary (Logo.dev) and a backup (UI Avatars). Track failure to swap on error.
  const { logoUrl, backupUrl } = useMemo(
    () => getCompanyLogo(companyName),
    [companyName],
  );
  const [logoError, setLogoError] = useState(false);

  // On first mount, derive the reducer state by comparing the stored committed payload
  // (if any) against the suggestions. This restores the user's accept/reject decisions
  // after a page reload, instead of resetting them all to "pending".
  const [decisionState, dispatch] = useReducer(
    tailorReducer,
    null,
    (): TailorState =>
      initialTailored
        ? deriveTailorState(initialTailored, initialCommitted)
        : EMPTY_STATE,
  );

  // Counts include the summary as a decision (it's just as much a user choice as any bullet).
  // Keeping summary out would create a bug where the counter says "4/4 pending" but the
  // Save button says "Accept 5 Pending" — two truths in the same UI.
  const counts = useMemo(() => {
    const values = [
      decisionState.summary,
      ...Object.values(decisionState.experience),
    ];
    return {
      pending: values.filter((v) => v === "pending").length,
      accepted: values.filter((v) => v === "accepted").length,
      rejected: values.filter((v) => v === "rejected").length,
      total: values.length,
    };
  }, [decisionState]);

  const totalPending = counts.pending;

  const isLoading = status === "loading";
  const isReady = status === "ready" && tailored !== null;

  return (
    <div className="space-y-8">
      {/* Job Context Card */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-zinc-800/60 flex items-center justify-center overflow-hidden">
              {/* Same pattern as ApplicationDrawer: Logo.dev primary, UI-Avatars fallback on 404. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoError ? backupUrl : logoUrl}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                Rewriting for
              </p>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {jobTitle}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">{companyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {matchScore !== null && (
              <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Match
                </span>
                <span className="text-sm font-black text-white">
                  {Math.round(matchScore)}%
                </span>
              </div>
            )}
            {extractedSkillsCount > 0 && (
              <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Job Description Required Skills
                </span>
                <span className="text-sm font-black text-white">
                  {extractedSkillsCount}
                </span>
              </div>
            )}
            {resumeTitle && (
              <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Source
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {resumeTitle}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => runTailor()}
            disabled={isLoading}
            className="flex items-center gap-2.5 bg-purple-500 text-zinc-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-purple-800 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Rewriting…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {tailored ? "Regenerate" : "Generate Rewrite"}
              </>
            )}
          </button>

          {tailoredAt && (
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Last rewritten {new Date(tailoredAt).toLocaleString()}
            </span>
          )}
        </div>

        {isReady && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => dispatch({ type: "ACCEPT_ALL" })}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Accept All Pending
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET" })}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            {/* Primary commit action — visually heaviest because it's the goal of this page. */}
            <button
              type="button"
              onClick={() => commit(decisionState)}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {totalPending === 0
                    ? "Save Decisions"
                    : `Save (Accept ${totalPending} Pending)`}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Save metadata strip — only shows once we have something meaningful to say */}
      {(committedAt || saveStatus === "error") && (
        <div className="flex items-center gap-3 -mt-4">
          {committedAt && saveStatus !== "error" && (
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
              Last saved {new Date(committedAt).toLocaleString()}
            </span>
          )}
          {saveStatus === "error" && saveError && (
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
              Save failed: {saveError}
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {status === "error" && error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
              Rewrite Failed
            </p>
            <p className="text-sm text-zinc-300">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {status === "idle" && !tailored && (
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
          <Sparkles className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
            No Rewrite Yet
          </p>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Generate an AI rewrite to adapt your resume to this specific job.
            Your original resume is never modified — you&apos;ll review every
            change before anything is saved.
          </p>
        </div>
      )}

      {/* Results */}
      {isReady && tailored && (
        <div className="space-y-6">
          <DecisionCounters counts={counts} total={counts.total} />

          {tailored.warnings && tailored.warnings.length > 0 && (
            <WarningsPanel warnings={tailored.warnings} />
          )}

          <SummaryDiff
            originalSummary={tailored.originalSummary ?? ""}
            tailoredSummary={tailored.tailoredSummary}
            decision={decisionState.summary}
            onAccept={() => dispatch({ type: "ACCEPT_SUMMARY" })}
            onReject={() => dispatch({ type: "REJECT_SUMMARY" })}
          />

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Work Experience
            </h3>
            {tailored.experience.map((entry) => {
              const key = experienceKey(entry);
              return (
                <ExperienceDiff
                  key={key}
                  entry={entry}
                  decision={decisionState.experience[key] ?? "pending"}
                  onAccept={() => dispatch({ type: "ACCEPT_EXPERIENCE", key })}
                  onReject={() => dispatch({ type: "REJECT_EXPERIENCE", key })}
                />
              );
            })}
          </div>

          <SkillsPanel
            skillsOrder={tailored.skillsOrder}
            emphasized={tailored.emphasizedSkills}
          />
        </div>
      )}
    </div>
  );
}

// --- Sub-components (kept colocated; promote to separate files if they grow) ---

function DecisionCounters({
  counts,
  total,
}: {
  counts: { pending: number; accepted: number; rejected: number };
  total: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <CounterTile
        label="Pending"
        value={counts.pending}
        total={total}
        tone="zinc"
      />
      <CounterTile
        label="Accepted"
        value={counts.accepted}
        total={total}
        tone="emerald"
      />
      <CounterTile
        label="Rejected"
        value={counts.rejected}
        total={total}
        tone="red"
      />
    </div>
  );
}

function CounterTile({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "zinc" | "emerald" | "red";
}) {
  const toneCls = {
    zinc: "text-zinc-300 border-zinc-800",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    red: "text-red-400 border-red-500/20 bg-red-500/5",
  }[tone];

  return (
    <div className={`bg-zinc-900/60 border rounded-xl p-4 ${toneCls}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black">
        {value}
        <span className="text-sm font-bold text-zinc-600">/{total}</span>
      </p>
    </div>
  );
}

function WarningsPanel({ warnings }: { warnings: string[] }) {
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
          // when warning text wraps to multiple lines. The mt-2 + h-1.5 align the bullet
          // with the first line's cap-height regardless of total line count.
          <li key={i} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 mt-2 bg-amber-500 rounded-full shrink-0" />
            <span className="text-sm text-zinc-300 leading-relaxed">{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionPill({ decision }: { decision: EntryDecision }) {
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

function AcceptRejectButtons({
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

function SummaryDiff({
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

function ExperienceDiff({
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
        // even if the rationale wraps. mt-[3px] is the tiny optical nudge to center the icon
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

function DiffPane({
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
          : muted
            ? "bg-zinc-950/40 border-zinc-800/60"
            : "bg-zinc-950/40 border-zinc-800/60"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-2 ${
          // CSS `uppercase` only transforms display — the JS string is still "Original" / "Rewritten".
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

function SkillsPanel({
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
