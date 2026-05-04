import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai/groq-client";
import { ResumeSchema } from "@/lib/ai/schema";

const BodySchema = z.object({
  resumeId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { company: true, resume: true },
  });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !application.jobTitle ||
    !application.extractedSkills ||
    !Array.isArray(application.extractedSkills) ||
    !application.company?.name
  ) {
    return NextResponse.json(
      { error: "Application is not yet enriched. Wait for scraping to finish." },
      { status: 409 },
    );
  }

  const resumeId = body.data.resumeId ?? application.resumeId ?? undefined;
  const resume = resumeId
    ? await prisma.resume.findUnique({ where: { id: resumeId } })
    : await prisma.resume.findFirst({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json(
      { error: "No resume available" },
      { status: 400 },
    );
  }

  const parsedResume = ResumeSchema.safeParse(resume.parsedData);
  if (!parsedResume.success) {
    return NextResponse.json(
      { error: "Stored resume failed schema validation" },
      { status: 500 },
    );
  }

  try {
    const result = await generateCoverLetter(
      parsedResume.data,
      application.jobTitle,
      application.company.name,
      application.extractedSkills as string[],
      application.company.researchData ?? undefined,
      application.jobDescription ?? undefined,
    );

    const updated = await prisma.application.update({
      where: { id },
      data: {
        coverLetter: result.coverLetter,
        coverLetterAt: new Date(),
        resumeId: resume.id,
      },
    });

    return NextResponse.json({
      coverLetter: result.coverLetter,
      toneNotes: result.toneNotes,
      coverLetterAt: updated.coverLetterAt,
      resumeId: resume.id,
    });
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    return NextResponse.json(
      { error: "Cover letter generation failed. Please try again." },
      { status: 500 },
    );
  }
}
