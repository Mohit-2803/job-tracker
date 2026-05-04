import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  TailoredResumeSchema,
  CommittedTailoredResumeSchema,
  type ParsedTailoredResume,
} from "@/lib/ai/schema";
import type { CommittedTailoredResume } from "@/components/applications/tailor/tailorReducer";
import { TailorStudio } from "@/components/applications/tailor/TailorStudio";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { company: true, resume: true },
  });

  if (!application) notFound();
  if (application.userId !== session.user.id) notFound();

  // Hydrate the stored tailored payload — defensively, since it's a Json column
  // that could in theory hold malformed data from a previous schema version.
  let initialTailored: ParsedTailoredResume | null = null;
  if (application.tailoredResumeData) {
    const parsed = TailoredResumeSchema.safeParse(
      application.tailoredResumeData,
    );
    if (parsed.success) initialTailored = parsed.data;
  }

  // Hydrate the committed payload — used to reconstruct the user's accept/reject
  // decisions on reload so the UI doesn't reset to "all pending" after a save.
  let initialCommitted: CommittedTailoredResume | null = null;
  if (application.committedResumeData) {
    const parsed = CommittedTailoredResumeSchema.safeParse(
      application.committedResumeData,
    );
    if (parsed.success) initialCommitted = parsed.data;
  }

  const companyName = application.company?.name ?? "Unknown Company";

  return (
    <div className="min-h-full">
      {/* Page Banner — intentionally not sticky. This page is a focused work session;
          chrome that doesn't hold an action only steals attention from the diffs.
          When we add the Save button later, we'll make THAT bar sticky instead. */}
      <div className="border-b border-white/5 px-6 lg:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-600 transition-all group"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm text-white tracking-widest uppercase truncate max-w-[260px] md:max-w-none">
                  Resume Rewrite
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  for {companyName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-10 max-w-7xl mx-auto relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

        <TailorStudio
          applicationId={application.id}
          jobTitle={application.jobTitle ?? "Untitled Role"}
          companyName={companyName}
          extractedSkillsCount={
            Array.isArray(application.extractedSkills)
              ? application.extractedSkills.length
              : 0
          }
          matchScore={application.matchScore ?? null}
          resumeId={application.resumeId ?? null}
          resumeTitle={application.resume?.title ?? null}
          initialTailored={initialTailored}
          tailoredAt={application.tailoredAt}
          initialCommitted={initialCommitted}
          initialCommittedAt={application.committedAt}
        />
      </div>
    </div>
  );
}
