import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractResumeData } from "@/lib/ai/groq-client";
import { uploadResumeFile } from "@/lib/cloudinary";

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

  const uploadResult = await uploadResumeFile(
    buffer,
    session.user.id,
    file.name,
  );

  const parsedData = await extractResumeData(rawText);

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      rawText: rawText,
      parsedData: parsedData,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    },
  });

  return NextResponse.json({ resume });
}
