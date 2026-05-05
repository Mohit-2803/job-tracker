import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPrintToken } from "@/lib/pdf/token";
import {
  CommittedTailoredResumeSchema,
  ResumeSchema,
  type ParsedResume,
} from "@/lib/ai/schema";
import type { CommittedTailoredResume } from "@/components/applications/tailor/tailorReducer";
import { ResumeTemplate } from "@/components/pdf/ResumeTemplate";

export const dynamic = "force-dynamic"; // never cache — every visit must re-verify

export default async function PrintResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const verification = verifyPrintToken(token, id);
  if (!verification.valid) notFound();

  const application = await prisma.application.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!application) notFound();

  // Defense in depth: token's `uid` must match the application's owner.
  // The token verifier already checked the signature, but ownership belongs to the DB.
  if (application.userId !== verification.userId) notFound();

  if (!application.committedResumeData) notFound();
  if (!application.resume) notFound();

  // Hydrate both stored JSON blobs with their Zod schemas — never feed raw Json to React.
  const committedParsed = CommittedTailoredResumeSchema.safeParse(
    application.committedResumeData,
  );
  const resumeParsed = ResumeSchema.safeParse(application.resume.parsedData);
  if (!committedParsed.success || !resumeParsed.success) notFound();

  const committed: CommittedTailoredResume = committedParsed.data;
  const parsedResume: ParsedResume = resumeParsed.data;

  // Root layout already provides <html>/<body>. We just render the template here
  // and rely on Playwright's printBackground:true to capture Tailwind colors.
  return <ResumeTemplate parsedResume={parsedResume} committed={committed} />;
}
