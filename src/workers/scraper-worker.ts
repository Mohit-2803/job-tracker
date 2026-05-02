import { Worker, Job } from "bullmq";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { getScraperForUrl } from "@/lib/scrapers/factory";
import { SCRAPER_QUEUE_NAME } from "@/lib/queue";
import {
  extractJobData,
  researchCompanyData,
  calculateMatchScoreWithAI,
} from "@/lib/ai/groq-client";

interface ScrapeJobPayload {
  applicationId: string;
  url: string;
}

/**
 * 1. Step: Research or Find the company
 */
async function getCompanyForJob(companyName: string, context?: string, scraper?: any) {
  let company = await prisma.company.findFirst({
    where: { name: companyName },
  });

  if (!company) {
    console.log(`[Worker] Researching new company: ${companyName}...`);
    const researchData = await scraper.researchCompany(companyName, context);
    company = await prisma.company.create({
      data: {
        name: companyName,
        researchData: researchData as any,
      },
    });
  }

  return company;
}

/**
 * 2. Step: Calculate the AI Match Analysis
 */
async function performMatchAnalysis(applicationId: string, jobTitle: string, jobSkills: string[], yearsOfExp?: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: { select: { id: true } } },
  });

  if (!app?.userId) return { score: 0, reasoning: "", missingSkills: [], proTip: "" };

  const latestResume = await prisma.resume.findFirst({
    where: { userId: app.userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  if (!latestResume) return { score: 0, reasoning: "No resume found.", missingSkills: [], proTip: "" };

  const parsedResume = latestResume.parsedData as any;
  const resumeSkills = parsedResume?.skills || [];
  const resumeSummary = parsedResume?.summary || "";

  if (!Array.isArray(resumeSkills) || jobSkills.length === 0) {
     return { score: 0, reasoning: "Insufficient data for scoring.", missingSkills: [], proTip: "" };
  }

  const analysis = await calculateMatchScoreWithAI(
    jobSkills, 
    resumeSkills, 
    jobTitle, 
    resumeSummary, 
    yearsOfExp
  );
  
  return {
    score: analysis.score,
    reasoning: analysis.reasoning,
    missingSkills: analysis.topMissingSkills || [],
    proTip: analysis.proTip || "",
  };
}

/**
 * MAIN WORKER ORCHESTRATOR
 */
const worker = new Worker<ScrapeJobPayload>(
  SCRAPER_QUEUE_NAME,
  async (job: Job<ScrapeJobPayload>) => {
    const { applicationId, url } = job.data;
    
    try {
      console.log(`[Worker] Starting job ${job.id} for: ${url}`);

      // Phase 1: Scraping
      const scraper = getScraperForUrl(url);
      const extractedData = await scraper.scrapeJob(url);

      // Phase 2: Company Enrichment
      const company = await getCompanyForJob(
        extractedData.companyName, 
        extractedData.rawCompanyContext, 
        scraper
      );

      // Phase 3: Strategic AI Match Analysis
      const analysis = await performMatchAnalysis(
        applicationId,
        extractedData.jobTitle,
        extractedData.extractedSkills,
        extractedData.yearsOfExperience
      );

      // Phase 4: Final Save
      await prisma.application.update({
        where: { id: applicationId },
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
          matchScore: analysis.score,
          matchReasoning: analysis.reasoning,
          topMissingSkills: analysis.missingSkills as any,
          proTip: analysis.proTip,
        },
      });

      console.log(`[Worker] ✅ Successfully processed Application: ${applicationId}`);

    } catch (error) {
      console.error(`[Worker] ❌ Error processing job ${job.id}:`, error);

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "FAILED" },
      }).catch((e) => console.error("[Worker] Failed to update status to FAILED:", e));

      throw error;
    }
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 1,
  },
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} permanently failed:`, err);
});

console.log("Scraper Worker is running and listening for jobs...");
