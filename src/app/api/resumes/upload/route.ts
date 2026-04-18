import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
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

  return NextResponse.json({ rawText });
}
