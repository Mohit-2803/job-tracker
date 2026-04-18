import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResumeSchema } from "@/lib/ai/schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const validated = ResumeSchema.safeParse(body.parsedData);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid resume data", issues: validated.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resume = await prisma.resume.update({
    where: { id },
    data: { parsedData: validated.data },
  });

  return NextResponse.json({ resume });
}
