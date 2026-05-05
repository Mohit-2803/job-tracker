import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signPrintToken } from "@/lib/pdf/token";
import { renderPdfFromUrl } from "@/lib/pdf/render";
import { env } from "@/env";

// Strip anything unsafe in a typical OS save dialog. Conservative — we'd rather
// drop a parenthesis than have a Windows machine refuse the file.
function sanitizeFilenamePart(s: string): string {
  return s.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Untitled";
}

// GET (not POST) because PDF rendering is idempotent from the user's perspective —
// no DB mutations. Iframes and <a href> downloads both work natively with GET,
// which avoids fetch-blob-download dance on the client.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      jobTitle: true,
      committedResumeData: true,
      company: { select: { name: true } },
    },
  });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Provenance gate: a PDF can only be produced from a committed (user-approved) version.
  // Without this, the user could download a PDF of unsaved suggestions.
  if (!application.committedResumeData) {
    return NextResponse.json(
      { error: "Save your decisions before exporting." },
      { status: 409 },
    );
  }

  // 60s signed URL — only Playwright (or a preview iframe) loads this, and either
  // way they'll fetch within seconds of token issue.
  const token = signPrintToken(id, session.user.id);
  const printUrl = `${env.APP_URL}/print/resume/${id}?token=${encodeURIComponent(token)}`;

  let pdf: Buffer;
  try {
    pdf = await renderPdfFromUrl(printUrl);
  } catch (error) {
    console.error("PDF render failed:", error);
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 },
    );
  }

  const company = sanitizeFilenamePart(application.company?.name ?? "Company");
  const jobTitle = sanitizeFilenamePart(application.jobTitle ?? "Role");
  const filename = `Resume - ${company} - ${jobTitle}.pdf`;

  // ?inline=true → preview in iframe (browser PDF viewer)
  // anything else → trigger download
  const isInline = request.nextUrl.searchParams.get("inline") === "true";
  const disposition = `${isInline ? "inline" : "attachment"}; filename="${filename}"`;

  // NextResponse with a Uint8Array is the binary-safe path. NextResponse.json would
  // base64-encode the bytes and corrupt the PDF on the wire.
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Content-Length": pdf.length.toString(),
      "Cache-Control": "private, no-store",
    },
  });
}
