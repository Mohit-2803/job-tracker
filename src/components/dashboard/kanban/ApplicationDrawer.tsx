import React from "react";
import { X, ExternalLink, Briefcase, Zap, AlertTriangle, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationDrawerProps {
  app: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDrawer({ app, isOpen, onClose }: ApplicationDrawerProps) {
  if (!isOpen || !app) return null;

  const researchData = app.company?.researchData as any;
  const score = app.matchScore;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl border-l border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform duration-500 ease-out overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-zinc-800/30">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              {app.jobTitle || "Untitled Job"}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2 flex items-center gap-2">
              <div className="w-1 h-1 bg-indigo-500 rounded-full" />
              {app.company?.name || "Unknown Company"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          
          {/* Match Score & Analysis Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-2.5 text-indigo-400" /> AI Insights
              </h3>
              {score !== null && (
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {Math.round(score)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Match Index</span>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-[1.5rem] p-6 text-sm text-zinc-400 leading-relaxed italic relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
              "{app.matchReasoning || "No reasoning provided."}"
            </div>
            
            {/* Strategy / Pro Tip */}
            {app.proTip && (
              <div className="mt-8 bg-white text-zinc-950 rounded-[1.5rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-2.5 mb-4 relative z-10">
                  <BadgeCheck className="w-4 h-4 text-zinc-900" />
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]">Strategic Advice</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed relative z-10">{app.proTip}</p>
              </div>
            )}

            {/* Missing Skills */}
            {app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0 && (
              <div className="mt-8 border border-zinc-800/50 rounded-[1.5rem] p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                  <h4 className="font-bold text-zinc-400 text-[10px] uppercase tracking-[0.2em]">Skill Gaps Detected</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.topMissingSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Company Research Section */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 flex items-center mb-8">
              <Briefcase className="w-3.5 h-3.5 mr-2.5 text-zinc-400" /> Company Intelligence
            </h3>
            
            {!researchData ? (
              <p className="text-sm text-zinc-600 italic">Awaiting deeper data signals...</p>
            ) : (
              <div className="space-y-8">
                {researchData.techStack && researchData.techStack.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Core Stack</span>
                    <div className="flex flex-wrap gap-2.5">
                      {researchData.techStack.map((tech: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1.5 bg-zinc-900/50 border border-zinc-800/30 text-zinc-400 rounded-md text-[10px] font-medium transition-colors hover:text-white hover:border-zinc-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-6">
                  {researchData.signals?.greenFlags && researchData.signals.greenFlags.length > 0 && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Strategic Signals</span>
                      <ul className="space-y-3">
                        {researchData.signals.greenFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="text-sm text-zinc-400 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] rounded-full mt-1.5 shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer Link */}
        {app.jobUrl && (
          <div className="p-8 border-t border-zinc-800/30">
            <a 
              href={app.jobUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center w-full py-4 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-2xl transition-all font-bold text-xs uppercase tracking-[0.2em] group shadow-2xl"
            >
              Original Posting <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
