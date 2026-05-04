import React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Briefcase,
  Zap,
  AlertTriangle,
  BadgeCheck,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Application, Company } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getCompanyLogo } from "@/lib/logos";

// Prisma-derived type — drawer takes an Application with its Company eagerly loaded.
// Loose-typing the JSON payloads (matchReasoning skills, etc.) since the drawer reads
// them defensively and they're already Zod-validated upstream.
export type ApplicationWithCompany = Application & {
  company: Company | null;
};

interface ApplicationDrawerProps {
  app: ApplicationWithCompany | null;
  isOpen: boolean;
  onClose: () => void;
}

// Narrow shape for the JSON `researchData` blob — only the keys this drawer reads.
type ResearchDataShape = {
  industry?: string;
  size?: string;
  techStack?: string[];
  signals?: { greenFlags?: string[] };
};

export function ApplicationDrawer({
  app,
  isOpen,
  onClose,
}: ApplicationDrawerProps) {
  const [imgError, setImgError] = React.useState(false);

  if (!isOpen || !app) return null;

  const researchData = app.company?.researchData as ResearchDataShape | null;
  const score = app.matchScore;
  const companyName = app.company?.name || "Unknown Company";
  const { logoUrl, backupUrl } = getCompanyLogo(companyName);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl border-l border-zinc-800/50 shadow-[0_0_80px_rgba(0,0,0,0.8)] z-[110] flex flex-col transform transition-transform duration-500 ease-out overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-zinc-800/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-zinc-800/50 flex items-center justify-center overflow-hidden">
              {/* Dynamic third-party CDN logo — see KanbanCard for rationale on why plain img is correct. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgError ? backupUrl : logoUrl}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight leading-tight">
                {app.jobTitle || "Untitled Job"}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 pr-2 border-r border-zinc-800">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {companyName}
                  </p>
                </div>

                {app.workModel && app.workModel.toLowerCase() !== "unknown" && (
                  <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    {app.workModel}
                  </span>
                )}
                {app.salaryRange &&
                  app.salaryRange.toLowerCase() !== "unknown" && (
                    <span className="text-[9px] font-black uppercase tracking-tight text-indigo-300 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                      {app.salaryRange}
                    </span>
                  )}
                {app.yearsOfExperience &&
                  app.yearsOfExperience.toLowerCase() !== "unknown" && (
                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700/50">
                      {app.yearsOfExperience}
                    </span>
                  )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {app.company?.linkedinUrl && (
              <a
                href={app.company.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-[#0077b5]/10 hover:border-[#0077b5]/30 rounded-xl transition-all text-zinc-400 hover:text-[#0077b5]"
                title="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            )}
            {app.company?.domain && (
              <a
                href={`https://${app.company.domain}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-indigo-500/10 hover:border-indigo-500/30 rounded-xl transition-all text-zinc-400 hover:text-indigo-400"
                title="Company Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          {/* Match Score & Analysis Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-500 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-2.5 text-indigo-400" /> AI
                Insights
              </h3>
              {score !== null && (
                <div className="flex flex-col items-end">
                  <span className="text-3xl text-white tracking-tighter">
                    {Math.round(score)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-zinc-300 font-bold mt-1">
                    Match Index
                  </span>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-[1.5rem] p-6 text-sm text-zinc-400 leading-relaxed italic relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
              &ldquo;{app.matchReasoning || "No reasoning provided."}&rdquo;
            </div>

            {/* Strategy / Pro Tip */}
            {app.proTip && (
              <div className="mt-8 bg-white text-zinc-950 rounded-[1.5rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-2.5 mb-4 relative z-10">
                  <BadgeCheck className="w-4 h-4 text-zinc-900" />
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]">
                    Strategic Advice
                  </h4>
                </div>
                <p className="text-sm font-medium leading-relaxed relative z-10">
                  {app.proTip}
                </p>
              </div>
            )}

            {/* Missing Skills */}
            {app.topMissingSkills &&
              Array.isArray(app.topMissingSkills) &&
              app.topMissingSkills.length > 0 && (
                <div className="mt-8 border border-red-800/50 rounded-[1.5rem] p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                    <h4 className="font-bold text-zinc-400 text-[10px] uppercase tracking-[0.2em]">
                      Skill Gaps Detected
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* topMissingSkills is a Prisma Json[] column — narrow with a runtime
                      string filter so TS gets a clean string[] without an `as` cast. */}
                    {(app.topMissingSkills as unknown[])
                      .filter((s): s is string => typeof s === "string")
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-tight"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
          </section>

          {/* Company Research Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-2.5 text-zinc-400" />{" "}
                Company Intelligence
              </h3>
              {app.company?.researchScore && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">
                    Score: {Math.round(app.company.researchScore)}%
                  </span>
                </div>
              )}
            </div>

            {!researchData ? (
              <p className="text-sm text-zinc-600 italic">
                Awaiting deeper data signals...
              </p>
            ) : (
              <div className="space-y-8">
                {/* Company Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {researchData.industry && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-1.5">
                        Industry
                      </span>
                      <span className="text-xs font-bold text-zinc-300 truncate block">
                        {researchData.industry}
                      </span>
                    </div>
                  )}
                  {researchData.size && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-1.5">
                        Headcount
                      </span>
                      <span className="text-xs font-bold text-zinc-300 truncate block">
                        {researchData.size}
                      </span>
                    </div>
                  )}
                </div>

                {researchData.techStack &&
                  researchData.techStack.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">
                        Core Stack
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {researchData.techStack.map(
                          (tech: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1.5 bg-zinc-900/50 border border-zinc-800/30 text-zinc-400 rounded-md text-[10px] font-medium transition-colors hover:text-white hover:border-zinc-700"
                            >
                              {tech}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-1 gap-6">
                  {researchData.signals?.greenFlags &&
                    researchData.signals.greenFlags.length > 0 && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                          Strategic Signals
                        </span>
                        <ul className="space-y-3">
                          {researchData.signals.greenFlags.map(
                            (flag: string, idx: number) => (
                              <li
                                key={idx}
                                className="text-sm text-zinc-400 flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] rounded-full mt-1.5 shrink-0" />
                                {flag}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-zinc-800/30 space-y-3">
          {/* Primary: open the focused work surface. Only enabled once scraping has produced a jobTitle —
              otherwise the studio's API will 409 and the user will hit a confusing error. */}
          <Link
            href={`/dashboard/applications/${app.id}`}
            aria-disabled={!app.jobTitle}
            onClick={(e) => {
              if (!app.jobTitle) e.preventDefault();
            }}
            className={cn(
              "flex items-center justify-center w-full py-4 px-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-[0.2em] group",
              app.jobTitle
                ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed",
            )}
            title={
              app.jobTitle
                ? "Rewrite your resume to match this job"
                : "Waiting for scraping to finish"
            }
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Rewrite Resume for This Job
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary: external reference */}
          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full py-3 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] group"
            >
              Original Posting{" "}
              <ExternalLink className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
