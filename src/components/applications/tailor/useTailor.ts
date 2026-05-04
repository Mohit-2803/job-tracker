"use client";

import { useState } from "react";
import {
  TailoredResumeSchema,
  type ParsedTailoredResume,
} from "@/lib/ai/schema";
import {
  commitTailoredResume,
  type TailorState,
} from "./tailorReducer";

export type TailorStatus = "idle" | "loading" | "ready" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useTailor(
  applicationId: string,
  initialTailored: ParsedTailoredResume | null,
  initialCommittedAt: Date | null = null,
) {
  const [tailored, setTailored] = useState<ParsedTailoredResume | null>(
    initialTailored,
  );
  // If we already have a stored tailored result, the hook starts in "ready" — not "idle".
  const [status, setStatus] = useState<TailorStatus>(
    initialTailored ? "ready" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  // Save state is independent from load state — the user might be saving while
  // simultaneously triggering a regenerate, and we want both states observable.
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [committedAt, setCommittedAt] = useState<Date | null>(
    initialCommittedAt,
  );

  async function runTailor(resumeId?: string): Promise<void> {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/applications/${applicationId}/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeId ? { resumeId } : {}),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setError(
          (payload && typeof payload.error === "string" && payload.error) ||
            `Tailoring failed (HTTP ${res.status})`,
        );
        return;
      }

      const parsed = TailoredResumeSchema.safeParse(payload?.tailored);
      if (!parsed.success) {
        setStatus("error");
        setError("Tailor response failed schema validation.");
        console.error(
          "TailoredResumeSchema validation issues:",
          parsed.error.issues,
        );
        return;
      }

      setTailored(parsed.data);
      setStatus("ready");
      // A new tailoring run invalidates any prior committed timestamp UX-wise —
      // the user now has fresh suggestions to re-decide. We don't clear the DB
      // (that's the route's job on its next save), just the visual indicator.
      setCommittedAt(null);
      setSaveStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error");
    }
  }

  async function commit(state: TailorState): Promise<void> {
    if (!tailored) {
      setSaveStatus("error");
      setSaveError("Nothing to save — run a rewrite first.");
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    // Pure merge — runs client-side so we don't pay a network round-trip for compute.
    const committedPayload = commitTailoredResume(tailored, state);

    try {
      const res = await fetch(
        `/api/applications/${applicationId}/tailor/commit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(committedPayload),
        },
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setSaveStatus("error");
        setSaveError(
          (payload && typeof payload.error === "string" && payload.error) ||
            `Save failed (HTTP ${res.status})`,
        );
        return;
      }

      // Server returns the authoritative timestamp — trust it over a client `new Date()`.
      const ts = payload?.committedAt ? new Date(payload.committedAt) : new Date();
      setCommittedAt(ts);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Network error");
    }
  }

  return {
    tailored,
    status,
    error,
    runTailor,
    saveStatus,
    saveError,
    committedAt,
    commit,
  };
}
