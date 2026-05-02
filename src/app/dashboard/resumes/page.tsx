import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeCard from "@/components/resume/ResumeCard";
import { FileText, Sparkles, Database } from "lucide-react";

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      parsedData: true,
    },
  });

  return (
    <div className="min-h-full p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl text-gray-300 tracking-tight">Intelligence Repository</h1>
          </div>
          <p className="text-sm font-medium text-zinc-500 max-w-xl">
            Upload and manage your professional identities. Our AI extracts market signals to power your job matches.
          </p>
        </div>
        
        <div className="flex items-center gap-4 px-5 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl backdrop-blur-xl">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Storage Status</p>
            <p className="text-sm font-bold text-white">{resumes.length} / 10 Assets</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Upload Portal */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-10 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Ingestion Portal</h2>
            </div>
            <ResumeUpload />
            
            {/* Pro Tips / Stats */}
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem]">
              <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Pro Insight
              </h4>
              <p className="text-[11px] text-indigo-300/70 leading-relaxed font-medium">
                Our parser detects over 5,000+ technical skills. Uploading a clean PDF ensures 99.8% extraction accuracy for better job matching.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Library */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="flex items-center gap-2 px-2 mb-6">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Asset Library</h2>
          </div>
          
          {resumes.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-[3rem] bg-zinc-900/20">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-600 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No Intelligence Assets Detected</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {resumes.map((r, idx) => {
                const parsed = r.parsedData as { skills?: string[] } | null;
                return (
                  <ResumeCard
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    createdAt={r.createdAt}
                    skillCount={parsed?.skills?.length}
                    isLatest={idx === 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
