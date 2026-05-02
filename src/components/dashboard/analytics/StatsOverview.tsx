"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Briefcase, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  stats: {
    total: number;
    interviewRate: number;
    avgMatch: number;
  };
  chartData: { date: string; count: number }[];
}

export function StatsOverview({ stats, chartData }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Stat Cards */}
      <div className="col-span-1 flex flex-col gap-4">
        {[
          { 
            label: "Portfolio Volume", 
            value: stats.total, 
            icon: Briefcase, 
            color: "text-indigo-400", 
            bg: "bg-indigo-500/10", 
            hover: "hover:bg-indigo-500/20",
            border: "group-hover:border-indigo-500/50"
          },
          { 
            label: "Success Trajectory", 
            value: `${stats.interviewRate}%`, 
            icon: TrendingUp, 
            color: "text-emerald-400", 
            bg: "bg-emerald-500/10", 
            hover: "hover:bg-emerald-500/20",
            border: "group-hover:border-emerald-500/50"
          },
          { 
            label: "Match Index", 
            value: `${stats.avgMatch}%`, 
            icon: Target, 
            color: "text-amber-400", 
            bg: "bg-amber-500/10", 
            hover: "hover:bg-amber-500/20",
            border: "group-hover:border-amber-500/50"
          },
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={cn(
              "bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 p-5 rounded-2xl shadow-2xl transition-all duration-300 group",
              item.hover,
              item.border
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-1 h-1 rounded-full", item.color.replace('text', 'bg'))} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{item.label}</span>
              </div>
              <div className={cn("p-1.5 rounded-lg transition-colors", item.bg, item.color)}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tighter">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Momentum Chart */}
      <div className="col-span-1 md:col-span-3 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 p-6 rounded-3xl shadow-2xl flex flex-col group/chart overflow-hidden relative">
        {/* Glow effect for chart background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              Application Momentum
            </h3>
            <p className="text-xs text-zinc-400">Global activity tracked over 14 days</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Live Analysis</span>
          </div>
        </div>
        
        <div className="flex-1 min-h-[180px] relative z-10">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIndigo)" 
                  animationDuration={2000}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
              Awaiting data signals...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
