import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommittedTailoredResumeSchema } from "@/lib/ai/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Validate body at the network boundary — never trust client JSON.
  const raw = await request.json().catch(() => null);
  const body = CommittedTailoredResumeSchema.safeParse(raw);
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid committed resume payload", issues: body.error.issues },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, userId: true, tailoredResumeData: true },
  });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // You can only commit decisions if a tailoring run has produced suggestions first.
  // Without this guard the user could POST arbitrary "committed" content with no AI provenance.
  if (!application.tailoredResumeData) {
    return NextResponse.json(
      { error: "Run tailoring before committing." },
      { status: 409 },
    );
  }

  const committedAt = new Date();
  await prisma.application.update({
    where: { id },
    data: {
      committedResumeData: body.data,
      committedAt,
    },
  });

  return NextResponse.json({ committed: true, committedAt });
}
