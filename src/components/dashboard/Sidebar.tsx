"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "My Resumes", icon: FileText },
  { href: "/dashboard/chat", label: "Career AI", icon: MessageSquare },
  { href: "/dashboard/billing", label: "Pro Plan", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col shrink-0 relative z-20">
      {/* Sophisticated Logo */}
      <div className="p-8">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center transition-all group-hover:rotate-12">
            <div className="w-2 h-2 bg-zinc-900 rounded-full" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase">Agent.io</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <div className="px-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Intelligence</span>
        </div>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                isActive 
                  ? "text-white" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-zinc-800 border border-zinc-700/50 rounded-lg -z-10 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-zinc-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Premium Dark Upsell Card */}
      <div className="p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />
          
          <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-indigo-500/10 rounded-lg">
               <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
             </div>
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Premium</span>
          </div>
          
          <p className="text-white text-sm font-medium mb-1">Scale your search</p>
          <p className="text-zinc-500 text-xs mb-4 leading-relaxed">Unlock advanced market signals.</p>
          
          <button className="w-full py-2 bg-white text-zinc-950 rounded-xl text-xs font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
