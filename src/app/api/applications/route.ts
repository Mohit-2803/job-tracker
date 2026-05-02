import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scraperQueue } from "@/lib/queue";
import { z } from "zod";

// Always validate input!
const CreateAppSchema = z.object({
  jobUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  // 1. Authenticate the user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // 2. Parse and validate the JSON body
    const body = await request.json();
    const { jobUrl } = CreateAppSchema.parse(body);

    // 3. Create the "Draft" Application in Postgres
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobUrl: jobUrl,
        status: "DRAFT", // Set initial status to DRAFT
      },
    });

    // 4. Enqueue the job to BullMQ
    await scraperQueue.add("scrape-job", {
      applicationId: application.id,
      url: jobUrl,
    });

    // 5. Return success immediately (do NOT wait for scraping)
    return NextResponse.json(
      {
        message: "Job queued for scraping",
        applicationId: application.id,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Failed to enqueue job:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
