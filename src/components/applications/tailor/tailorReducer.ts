import type { ParsedTailoredResume } from "@/lib/ai/schema";

export type EntryDecision = "pending" | "accepted" | "rejected";

export type TailorState = {
  summary: EntryDecision; // one decision for the summary
  experience: Record<string, EntryDecision>; // one decision per experience entry, keyed by experienceKey()
};

export type TailorAction =
  | { type: "ACCEPT_SUMMARY" }
  | { type: "REJECT_SUMMARY" }
  | { type: "ACCEPT_EXPERIENCE"; key: string }
  | { type: "REJECT_EXPERIENCE"; key: string }
  | { type: "ACCEPT_ALL" } // bulk: every pending → accepted
  | { type: "RESET" } // back to all pending, preserves keys
  | { type: "HYDRATE"; state: TailorState }; // replace entire state — used when a regenerate produces new entries

export function tailorReducer(
  state: TailorState,
  action: TailorAction,
): TailorState {
  switch (action.type) {
    case "ACCEPT_SUMMARY":
      return { ...state, summary: "accepted" };
    case "REJECT_SUMMARY":
      return { ...state, summary: "rejected" };
    case "ACCEPT_EXPERIENCE":
      return {
        ...state,
        experience: { ...state.experience, [action.key]: "accepted" },
      };
    case "REJECT_EXPERIENCE":
      return {
        ...state,
        experience: { ...state.experience, [action.key]: "rejected" },
      };
    case "ACCEPT_ALL":
      return {
        summary: state.summary === "pending" ? "accepted" : state.summary,
        experience: Object.fromEntries(
          Object.entries(state.experience).map(([key, value]) => [
            key,
            value === "pending" ? "accepted" : value,
          ]),
        ),
      };
    case "RESET":
      return {
        summary: "pending",
        experience: Object.fromEntries(
          Object.keys(state.experience).map((key) => [key, "pending"]),
        ),
      };
    case "HYDRATE":
      // Wholesale replacement — caller decides the new shape (typically derived from a fresh
      // tailor result + any prior committed state). Used when Regenerate lands and the old
      // experience keys may no longer exist.
      return action.state;
    default:
      return state;
  }
}

// Deterministic key for an experience entry. Composite (company + role + startDate)
// so two roles at the same company don't collide and reordering can't desync the map.
export function experienceKey(entry: {
  company: string;
  role: string;
  startDate?: string;
}): string {
  return `${entry.company}::${entry.role}::${entry.startDate ?? ""}`;
}

// Derives the starting state from an LLM tailor response: every entry begins "pending".
// Centralizing this here keeps the keying convention in one place.
export function initialTailorState(
  tailored: ParsedTailoredResume,
): TailorState {
  return {
    summary: "pending",
    experience: Object.fromEntries(
      tailored.experience.map((entry) => [experienceKey(entry), "pending"]),
    ),
  };
}

// Output shape committed to the database when the user saves.
// Mirrors the LLM response but with originals/tailored collapsed per the user's decisions.
export type CommittedTailoredResume = {
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  skillsOrder: string[];
  emphasizedSkills: string[];
};

// Reverse of commitTailoredResume: given a previously-committed flat resume + the original
// suggestions, reconstruct the user's accept/reject decisions. Used on page reload so the
// UI doesn't show "all pending" after the user already saved.
//
// Comparison strategy is text equality per entry:
//   - committed text matches tailored.tailoredDescription → user accepted
//   - committed text matches tailored.originalDescription → user rejected
//   - both match (entry was unchanged anyway) → treat as accepted (no diff to display)
//   - neither matches (user hand-edited, or LLM regenerated different output) → pending
export function deriveTailorState(
  tailored: ParsedTailoredResume,
  committed: CommittedTailoredResume | null,
): TailorState {
  if (!committed) return initialTailorState(tailored);

  const summary: EntryDecision =
    committed.summary === tailored.tailoredSummary
      ? "accepted"
      : committed.summary === (tailored.originalSummary ?? "")
        ? "rejected"
        : "pending";

  const experience: Record<string, EntryDecision> = {};
  for (const entry of tailored.experience) {
    const key = experienceKey(entry);
    const committedEntry = committed.experience.find(
      (c) =>
        c.company === entry.company &&
        c.role === entry.role &&
        (c.startDate ?? "") === (entry.startDate ?? ""),
    );
    if (!committedEntry) {
      experience[key] = "pending";
      continue;
    }
    if (committedEntry.description === entry.tailoredDescription) {
      experience[key] = "accepted";
    } else if (committedEntry.description === entry.originalDescription) {
      experience[key] = "rejected";
    } else {
      experience[key] = "pending";
    }
  }

  return { summary, experience };
}

// Merge the LLM suggestion with the user's accept/reject decisions into the final committed resume.
// Pending entries are treated as accepted (default-to-suggestion); rejected entries fall back to the original.
// Pure function — call this at save time, not during render.
export function commitTailoredResume(
  tailored: ParsedTailoredResume,
  state: TailorState,
): CommittedTailoredResume {
  const summary =
    state.summary === "rejected"
      ? (tailored.originalSummary ?? "")
      : tailored.tailoredSummary;

  const experience = tailored.experience.map((entry) => {
    const decision = state.experience[experienceKey(entry)] ?? "pending";
    const description =
      decision === "rejected"
        ? entry.originalDescription
        : entry.tailoredDescription;
    return {
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description,
    };
  });

  return {
    summary,
    experience,
    skillsOrder: tailored.skillsOrder,
    emphasizedSkills: tailored.emphasizedSkills,
  };
}
