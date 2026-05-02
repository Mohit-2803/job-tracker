import { AppStatus, Company } from "@prisma/client";
import { Briefcase, MapPin, BadgeCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Assuming we pass application with its company
type ApplicationWithCompany = {
  id: string;
  jobTitle: string | null;
  jobLocation: string | null;
  matchScore: number | null;
  matchReasoning: string | null;
  topMissingSkills: any;
  proTip: string | null;
  status: AppStatus;
  company: {
    name: string;
  } | null;
};

export function KanbanCard({ app, onClick }: { app: ApplicationWithCompany, onClick?: () => void }) {
  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const score = app.matchScore;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md transition-all rounded-xl p-4 cursor-grab active:cursor-grabbing mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 truncate pr-2 max-w-[180px]">
            {app.jobTitle || "Untitled Job"}
          </h4>
          <p className="text-sm text-gray-500 font-medium">
            {app.company?.name || "Unknown Company"}
          </p>
        </div>
        
        {/* Match Score Badge */}
        {score !== null && (
          <div
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 rounded-lg border",
              getScoreColor(score)
            )}
          >
            <span className="text-xs font-bold leading-none">{Math.round(score)}%</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80 mt-0.5">Match</span>
          </div>
        )}
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
        {app.jobLocation && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{app.jobLocation}</span>
          </div>
        )}
      </div>

      {/* Insight Badges (Glassy look) */}
      {(app.proTip || app.topMissingSkills) && (
        <div className="pt-3 border-t border-gray-100/50 mt-2 flex items-center justify-between">
           {app.proTip && (
             <div className="flex items-center text-xs text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-md">
               <BadgeCheck className="w-3.5 h-3.5 mr-1" />
               <span className="font-medium">Pro Tip</span>
             </div>
           )}
           {app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0 && (
             <div className="flex items-center text-xs text-rose-500 bg-rose-50/50 px-2 py-1 rounded-md">
               <AlertTriangle className="w-3.5 h-3.5 mr-1" />
               <span className="font-medium">Missing Skills</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
