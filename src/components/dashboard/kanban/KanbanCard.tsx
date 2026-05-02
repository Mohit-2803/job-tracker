"use client";

import React from "react";
import { MapPin, BadgeCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getCompanyLogo } from "@/lib/logos";

export function KanbanCard({ app, onClick }: { app: any, onClick?: () => void }) {
  const score = app.matchScore;
  const companyName = app.company?.name || "Unknown";
  const [imgError, setImgError] = React.useState(false);
  const { logoUrl, backupUrl } = getCompanyLogo(companyName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-indigo-500/10 hover:border-zinc-700 transition-all duration-300 rounded-2xl p-5 cursor-grab active:cursor-grabbing mb-4 overflow-hidden"
    >
      {/* Top Section: Logo & Score */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white border border-zinc-700/30 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-zinc-500 transition-colors">
            <img 
              src={imgError ? backupUrl : logoUrl} 
              alt={companyName}
              className="w-full h-full object-cover transition-all duration-500 scale-90 group-hover:scale-100"
              loading="lazy"
              onError={(e) => {
                console.error(`[Logo Error] Failed to load logo for ${companyName}: ${logoUrl}`);
                setImgError(true);
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate pr-2 text-[15px] tracking-tight group-hover:text-indigo-300 transition-colors">
              {app.jobTitle || "Untitled Job"}
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
              {companyName}
            </p>
          </div>
        </div>
        
        {/* Dynamic Match Score */}
        {score !== null && (
          <div className="flex flex-col items-end">
            <div className="relative flex items-center justify-center">
              <span className="text-xl font-black text-white tracking-tighter leading-none relative z-10">
                {Math.round(score)}%
              </span>
              <div 
                className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </div>
            <span className="text-[8px] uppercase tracking-tighter font-bold text-zinc-500 mt-1">Match</span>
          </div>
        )}
      </div>

      <div className="flex items-center text-[11px] font-medium text-zinc-400 mb-5 space-x-4 relative z-10">
        {app.jobLocation && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700/50">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-[140px] text-zinc-300">{app.jobLocation}</span>
          </div>
        )}
      </div>

      {/* Insight Badges (Minimalist & Interactive) */}
      {(app.proTip || app.topMissingSkills) && (
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
           <div className="flex gap-2">
             {app.proTip && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-xl" title="Pro Tip available">
                 <BadgeCheck className="w-3.5 h-3.5 text-zinc-950" />
                 <span className="text-[8px] font-black text-zinc-950 uppercase tracking-widest">Strategy</span>
               </div>
             )}
             {app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0 && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg" title="Skill Gaps detected">
                 <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                 <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Gaps</span>
               </div>
             )}
           </div>
           
           <motion.span 
             initial={{ x: -5, opacity: 0 }}
             whileHover={{ x: 0, opacity: 1 }}
             className="text-[10px] font-black text-white uppercase tracking-[0.2em] hidden group-hover:block transition-all"
           >
             Analyze →
           </motion.span>
        </div>
      )}

      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mb-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
    </motion.div>
  );
}
