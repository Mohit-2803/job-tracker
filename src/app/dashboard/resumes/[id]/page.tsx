import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ResumeEditForm from "@/components/resume/ResumeEditForm";
import type { ParsedResume } from "@/lib/ai/schema";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });

  if (!resume) notFound();
  if (resume.userId !== session.user.id) notFound();

  return (
    <div className="min-h-full">
      {/* Sticky Command Header */}
      <div className="sticky top-0 z-60 bg-[#0c0c0e]/60 backdrop-blur-3xl border-b border-white/5 px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {/* Tactical Breadcrumb */}
            <Link
              href="/dashboard/resumes"
              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-600 transition-all group"
              title="Back to Repository"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-white tracking-widest uppercase truncate max-w-[200px] md:max-w-none">
                    {resume.title}
                  </h1>
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  System Ingest: {resume.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {resume.fileUrl && (
              <a
                href={`${resume.fileUrl}?fl_attachment=${encodeURIComponent(resume.title)}`}
                className="flex items-center gap-2.5 bg-white text-zinc-950 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Source</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-10 max-w-7xl mx-auto relative">
        {/* Background Decorative Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-200 h-200 bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

        <ResumeEditForm
          resumeId={resume.id}
          initialData={resume.parsedData as ParsedResume}
        />
      </div>
    </div>
  );
}
