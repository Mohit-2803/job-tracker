import { Worker, Job } from "bullmq";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { GenericScraper } from "@/lib/scrapers/generic";
import { SCRAPER_QUEUE_NAME } from "@/lib/queue";

// The payload we expect when an API route enqueues a job
interface ScrapeJobPayload {
  applicationId: string;
  url: string;
}

const worker = new Worker<ScrapeJobPayload>(
  SCRAPER_QUEUE_NAME,
  async (job: Job<ScrapeJobPayload>) => {
    console.log(`Processing job ${job.id} for url: ${job.data.url}`);
    
    // 1. Instantiate your Scraper
    const scraper = new GenericScraper();

    // 2. Await the scrapeJob method
    const extractedData = await scraper.scrapeJob(job.data.url);

    // 3. Update the Application in the database using Prisma
    let company = await prisma.company.findFirst({
      where: { name: extractedData.companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: { name: extractedData.companyName }
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
        status: "DRAFT", // Usually scraping a URL means you're drafting it, not applied yet!
      },
    });

    console.log(`Successfully scraped and saved data for Application: ${job.data.applicationId}`);
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 1, // Let's process 1 job at a time for now to avoid IP bans
  }
);

// Basic error handling so the worker doesn't crash silently
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Scraper Worker is running and listening for jobs...");
