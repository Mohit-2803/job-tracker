"use client";

import React from "react";
import { MapPin, BadgeCheck, AlertTriangle, Sparkles } from "lucide-react";
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
      {/* Top Section: Logo & Signal */}
      <div className="flex justify-between items-start mb-6 relative z-10 gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-white border border-zinc-700/30 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-zinc-500 transition-colors">
            {/* Dynamic third-party CDN logo (Logo.dev / UI-Avatars). Plain img is correct here —
                proxying through next/image adds infra cost without optimization win on already-small CDN assets. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgError ? backupUrl : logoUrl}
              alt={companyName}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                console.error(`[Logo Error] Failed to load logo for ${companyName}: ${logoUrl}`);
                setImgError(true);
              }}
            />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h4 className="font-bold text-white truncate text-[15px] leading-tight tracking-tight group-hover:text-indigo-300 transition-colors">
              {app.jobTitle || "Untitled Job"}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1 h-1 bg-indigo-500 rounded-full shrink-0 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 truncate">
                {companyName}
              </p>
            </div>
          </div>
        </div>
        
        {/* Intelligence Signal Badge */}
        {score !== null && (
          <div className="flex shrink-0 flex-col items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 shadow-inner group-hover:border-indigo-500/30 transition-all">
            <span className="text-[16px] font-black text-white tracking-tighter leading-none">
              {Math.round(score)}%
            </span>
            <span className="text-[7px] uppercase tracking-tighter font-black text-zinc-600 mt-1">Match</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
        {app.jobLocation && app.jobLocation.toLowerCase() !== 'unknown' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-[120px] text-[10px] font-medium text-zinc-300">{app.jobLocation}</span>
          </div>
        )}
        {app.workModel && app.workModel.toLowerCase() !== 'unknown' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
            <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500">{app.workModel}</span>
          </div>
        )}
        {app.salaryRange && app.salaryRange.toLowerCase() !== 'unknown' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
            <span className="text-[10px] font-black text-indigo-300 tracking-tight">{app.salaryRange}</span>
          </div>
        )}
        {app.yearsOfExperience && app.yearsOfExperience.toLowerCase() !== 'unknown' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
            <span className="text-[10px] font-medium text-zinc-400">{app.yearsOfExperience}</span>
          </div>
        )}
      </div>

      {/* Insight Badges (Minimalist & Interactive) */}
      {(app.proTip || app.committedAt || (app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0)) && (
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
           <div className="flex gap-2">
             {app.committedAt && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg" title="Resume rewritten and saved for this job">
                 <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                 <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Tailored</span>
               </div>
             )}
             {app.proTip && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-xl" title="Pro Tip available">
                 <BadgeCheck className="w-3.5 h-3.5 text-zinc-950" />
                 <span className="text-[8px] font-black text-zinc-950 uppercase tracking-widest">Strategy</span>
               </div>
             )}
             {app.topMissingSkills && Array.isArray(app.topMissingSkills) && app.topMissingSkills.length > 0 && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-800 rounded-lg" title="Skill Gaps detected">
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
