import Link from "next/link";
import { FileText, Calendar, ShieldCheck, Zap, ArrowUpRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type ResumeCardProps = {
  id: string;
  title: string;
  createdAt: Date;
  skillCount?: number;
  isLatest?: boolean;
};

export default function ResumeCard({
  id,
  title,
  createdAt,
  skillCount,
  isLatest,
}: ResumeCardProps) {
  return (
    <Link
      href={`/dashboard/resumes/${id}`}
      className="group relative block h-full"
    >
      {/* Background Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition-all duration-700" />
      
      <div className="relative h-full flex flex-col p-6 bg-[#0c0c0e]/80 backdrop-blur-2xl border border-zinc-800/50 rounded-[2rem] hover:border-zinc-700/50 hover:bg-[#0c0c0e]/95 transition-all duration-500 overflow-hidden shadow-2xl">
        
        {/* Card Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:scale-110 transition-all duration-500 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <div className="p-2 bg-zinc-950/50 rounded-xl border border-zinc-800 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
        
        {/* Card Content */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Asset</span>
              {isLatest && (
                <>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">Latest</span>
                </>
              )}
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            </div>
            <h3 className="font-black text-white text-lg tracking-tight leading-tight group-hover:text-indigo-300 transition-colors truncate">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Last Sync</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Calendar className="w-3 h-3 text-zinc-600" />
                {createdAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>

            <div className="w-[1px] h-6 bg-zinc-800" />

            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">AI Nodes</span>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                {skillCount || 0} Skills
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
          <ShieldCheck className="w-24 h-24 text-white -rotate-12" />
        </div>
      </div>
    </Link>
  );
}
