import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ResumeEditForm from "@/components/resume/ResumeEditForm";
import type { ParsedResume } from "@/lib/ai/schema";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/dashboard/resumes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to resumes
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{resume.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review what the AI extracted. Edit anything that is wrong — this data is used for match scoring and tailoring.
        </p>
      </div>

      <ResumeEditForm
        resumeId={resume.id}
        initialData={resume.parsedData as ParsedResume}
      />
    </div>
  );
}
