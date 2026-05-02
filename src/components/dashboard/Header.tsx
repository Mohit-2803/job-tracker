import { signOut } from "@/lib/auth";
import type { User } from "next-auth";
import Image from "next/image";
import { Search, Bell, Settings, LogOut, ChevronRight } from "lucide-react";

export default function Header({ user }: { user: User }) {
  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 relative z-10 border-b border-zinc-800/30">
      {/* Search & Breadcrumbs */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span>Intelligence</span>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-zinc-100">Overview</span>
        </div>

        <div className="relative w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-100 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Intelligence..." 
            className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-xl py-2.5 pl-12 pr-12 text-sm text-zinc-100 outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-700 focus:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all placeholder:text-zinc-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm">
            <span className="text-[10px] font-bold text-zinc-500">⌘</span>
            <span className="text-[10px] font-bold text-zinc-500">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all shadow-sm group">
            <Bell className="w-4 h-4" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-zinc-950 rounded-full group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-2.5 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all shadow-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-zinc-800/60 mx-1" />

        <div className="flex items-center gap-4 pl-2 group">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-white leading-none">{user.name}</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter mt-1.5 flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              Pro Intelligence
            </span>
          </div>
          
          <div className="relative cursor-pointer">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={36}
                height={36}
                className="rounded-xl border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform"
              />
            ) : (
               <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-zinc-950 text-xs font-bold border border-zinc-200 shadow-sm">
                 {user.name?.[0] || user.email?.[0]}
               </div>
            )}
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
