import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/dashboard/kanban/KanbanBoard";
import { StatsOverview } from "@/components/dashboard/analytics/StatsOverview";
import { AppStatus } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  
  const applications = await prisma.application.findMany({
    where: { userId: session?.user?.id },
    include: { company: true },
    orderBy: { createdAt: "desc" }
  });

  // Analytics Computation
  const total = applications.length;
  
  const interviewCount = applications.filter(a => 
    a.status === AppStatus.INTERVIEW || a.status === AppStatus.OFFER
  ).length;
  
  const activeAppsCount = applications.filter(a => 
    a.status !== AppStatus.DRAFT && a.status !== AppStatus.PENDING && a.status !== AppStatus.FAILED
  ).length;

  const interviewRate = activeAppsCount > 0 
    ? Math.round((interviewCount / activeAppsCount) * 100) 
    : 0;

  const scoredApps = applications.filter(a => a.matchScore !== null);
  const avgMatch = scoredApps.length > 0
    ? Math.round(scoredApps.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / scoredApps.length)
    : 0;

  // Velocity Chart Data (Last 14 days)
  const chartData = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const count = applications.filter(a => {
      const appDate = new Date(a.createdAt);
      return appDate.getDate() === d.getDate() && appDate.getMonth() === d.getMonth() && appDate.getFullYear() === d.getFullYear();
    }).length;

    chartData.push({ date: dateStr, count });
  }

  const stats = { total, interviewRate, avgMatch };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10">
        <h1 className="text-3xl text-gray-300 tracking-tight">Strategic Intelligence</h1>
        <p className="text-sm font-medium text-zinc-400 mt-1 uppercase tracking-widest">Global Pipeline Analysis & Performance Metrics</p>
      </div>

      <StatsOverview stats={stats} chartData={chartData} />
      
      <div className="flex-1 min-h-0 mt-4">
        <KanbanBoard initialApplications={applications} />
      </div>
    </div>
  );
}
