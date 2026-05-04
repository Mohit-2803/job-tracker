"use client";

import { useReducer, useMemo, useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Check,
  RotateCcw,
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
  type CommittedTailoredResume,
} from "./tailorReducer";
import { getCompanyLogo } from "@/lib/logos";
import { DecisionCounters } from "./parts/DecisionCounters";
import { WarningsPanel } from "./parts/WarningsPanel";
import { SummaryDiff } from "./parts/SummaryDiff";
import { ExperienceDiff } from "./parts/ExperienceDiff";
import { SkillsPanel } from "./parts/SkillsPanel";
import type { ParsedTailoredResume } from "@/lib/ai/schema";

type Props = {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  extractedSkillsCount: number;
  matchScore: number | null;
  resumeId: string | null;
  resumeTitle: string | null;
  initialTailored: ParsedTailoredResume | null;
  initialTailoredAt: Date | null;
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
  initialTailoredAt,
  initialCommitted,
  initialCommittedAt,
}: Props) {
  const {
    tailored,
    tailoredAt,
    status,
    error,
    runTailor,
    saveStatus,
    saveError,
    committedAt,
    commit,
    resetSaveStatus,
  } = useTailor(
    applicationId,
    initialTailored,
    initialTailoredAt,
    initialCommittedAt,
  );

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

  // BUG FIX #2 — when Regenerate produces a NEW tailored result (different identity),
  // the reducer state from the previous run is stale. Re-derive against the new result.
  // We track the previous identity in a ref so this only fires on real changes, not on every render.
  const prevTailoredRef = useRef(tailored);
  useEffect(() => {
    if (tailored && tailored !== prevTailoredRef.current) {
      prevTailoredRef.current = tailored;
      // No committed payload to compare against — a fresh regenerate invalidates the prior commit.
      dispatch({ type: "HYDRATE", state: deriveTailorState(tailored, null) });
    }
  }, [tailored]);

  // BUG FIX #1 — once the user changes any decision after a successful save, the "Saved"
  // label is misleading because the persisted state no longer matches the in-memory state.
  // Flip the save status back to idle so the button reverts to "Save (Accept N Pending)".
  // We compare against decisionState identity — every dispatch produces a new object.
  useEffect(() => {
    if (saveStatus === "saved") resetSaveStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionState]);

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
