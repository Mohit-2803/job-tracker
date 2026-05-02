"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Briefcase, TrendingUp, Target } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Stat Cards */}
      <div className="col-span-1 flex flex-col gap-4">
        <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center text-gray-500 mb-2">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold uppercase tracking-wider">Total Applied</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center text-blue-500 mb-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Interview Rate</span>
          </div>
          <div className="text-3xl font-bold text-blue-700">{stats.interviewRate}%</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center text-emerald-500 mb-2">
            <Target className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Avg Match</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700">{stats.avgMatch}%</div>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="col-span-1 md:col-span-3 bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm flex flex-col">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Application Velocity (Last 14 Days)</h3>
        <div className="flex-1 min-h-[150px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
              No applications in the last 14 days. Time to get hunting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
