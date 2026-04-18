import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeCard from "@/components/resume/ResumeCard";

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
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a PDF or DOCX resume to get started.
        </p>
      </div>

      <ResumeUpload />

      {resumes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Resumes</h2>
          {resumes.map((r) => {
            const parsed = r.parsedData as { skills?: string[] } | null;
            return (
              <ResumeCard
                key={r.id}
                id={r.id}
                title={r.title}
                createdAt={r.createdAt}
                skillCount={parsed?.skills?.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
