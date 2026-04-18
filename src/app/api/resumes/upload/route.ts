import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText = "";

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    rawText = data.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  }

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      rawText: rawText,
      parsedData: {},
    },
  });

  return NextResponse.json({ resume });
}
