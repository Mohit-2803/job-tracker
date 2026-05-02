import React from "react";
import { X, ExternalLink, Briefcase, Zap, AlertTriangle, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStatus } from "@prisma/client";

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
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-l border-white/40 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {app.jobTitle || "Untitled Job"}
            </h2>
            <p className="text-sm font-medium text-blue-600 mt-1">
              {app.company?.name || "Unknown Company"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Match Score & Analysis Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center">
                <Zap className="w-4 h-4 mr-2" /> AI Match Analysis
              </h3>
              {score !== null && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-bold border",
                  score >= 80 ? "bg-green-100 text-green-700 border-green-200" :
                  score >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                  "bg-red-100 text-red-700 border-red-200"
                )}>
                  {Math.round(score)}% Match
                </span>
              )}
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed shadow-inner">
              {app.matchReasoning || "No reasoning provided."}
            </div>
            
            {/* Strategy / Pro Tip */}
            {app.proTip && (
              <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-800 text-sm mb-1">Pro Tip</h4>
                  <p className="text-sm text-emerald-700/90 leading-relaxed">{app.proTip}</p>
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0 && (
              <div className="mt-4 bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-800 text-sm mb-1">Top Missing Skills</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.topMissingSkills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-rose-100 text-rose-700 rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Company Research Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center mb-4">
              <Briefcase className="w-4 h-4 mr-2" /> Company Intelligence
            </h3>
            
            {!researchData ? (
              <p className="text-sm text-gray-500 italic">No research data available for this company.</p>
            ) : (
              <div className="space-y-4">
                {researchData.techStack && researchData.techStack.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Tech Stack</span>
                    <div className="flex flex-wrap gap-2">
                      {researchData.techStack.map((tech: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {researchData.signals?.greenFlags && researchData.signals.greenFlags.length > 0 && (
                  <div className="bg-green-50/30 p-3 rounded-lg border border-green-100">
                    <span className="text-xs font-semibold text-green-800 uppercase tracking-wider block mb-2">Green Flags</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {researchData.signals.greenFlags.map((flag: string, idx: number) => (
                        <li key={idx} className="text-sm text-green-700/90">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchData.signals?.redFlags && researchData.signals.redFlags.length > 0 && (
                  <div className="bg-red-50/30 p-3 rounded-lg border border-red-100">
                    <span className="text-xs font-semibold text-red-800 uppercase tracking-wider block mb-2">Red Flags</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {researchData.signals.redFlags.map((flag: string, idx: number) => (
                        <li key={idx} className="text-sm text-red-700/90">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* External Link */}
          {app.jobUrl && (
            <div className="pt-4 border-t border-gray-100">
              <a 
                href={app.jobUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm"
              >
                View Original Posting <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
