import { Worker, Job } from "bullmq";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { getScraperForUrl } from "@/lib/scrapers/factory";
import { SCRAPER_QUEUE_NAME } from "@/lib/queue";
import { calculateMatchScore } from "@/lib/scoring";

// The payload we expect when an API route enqueues a job
interface ScrapeJobPayload {
  applicationId: string;
  url: string;
}

const worker = new Worker<ScrapeJobPayload>(
  SCRAPER_QUEUE_NAME,
  async (job: Job<ScrapeJobPayload>) => {
    console.log(`Processing job ${job.id} for url: ${job.data.url}`);

    const scraper = getScraperForUrl(job.data.url);

    const extractedData = await scraper.scrapeJob(job.data.url);

    const app = await prisma.application.findUnique({
      where: { id: job.data.applicationId },
      include: { user: { select: { id: true } } },
    });

    if (!app || !app.userId) {
      throw new Error(
        `Application not found or no user associated: ${job.data.applicationId}`,
      );
    }

    let matchScore = 0;
    if (app?.userId) {
      const latestResume = await prisma.resume.findFirst({
        where: {
          userId: app.userId,
          deletedAt: null,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const parsedResume = latestResume?.parsedData as any;
      const resumeSkills = parsedResume?.skills;

      if (
        latestResume &&
        extractedData.extractedSkills &&
        Array.isArray(resumeSkills)
      ) {
        matchScore = calculateMatchScore(
          extractedData.extractedSkills,
          resumeSkills,
        );
        console.log(`[Worker] Match Score calculated: ${matchScore}%`);
      }
    }

    let company = await prisma.company.findFirst({
      where: { name: extractedData.companyName },
    });

    if (!company) {
      // 1. Research the company using raw context extracted from the page
      const researchData = await scraper.researchCompany(
        extractedData.companyName,
        extractedData.rawCompanyContext,
      );

      // 2. Save it!
      company = await prisma.company.create({
        data: {
          name: extractedData.companyName,
          researchData: researchData as any,
        },
      });
    } 


    // Update the Application with the correctly mapped fields
    await prisma.application.update({
      where: { id: job.data.applicationId },
      data: {
        jobTitle: extractedData.jobTitle,
        jobDescription: extractedData.jobDescription,
        extractedSkills: extractedData.extractedSkills,
        jobLocation: extractedData.jobLocation,
        salaryRange: extractedData.salaryRange,
        workModel: extractedData.workModel,
        employmentType: extractedData.employmentType,
        yearsOfExperience: extractedData.yearsOfExperience,
        companyId: company.id,
        status: "DRAFT",
        matchScore: matchScore,
      },
    });

    console.log(
      `Successfully scraped and saved data for Application: ${job.data.applicationId}`,
    );
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 1, // Let's process 1 job at a time for now to avoid IP bans
  },
);

// Basic error handling so the worker doesn't crash silently
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Scraper Worker is running and listening for jobs...");
