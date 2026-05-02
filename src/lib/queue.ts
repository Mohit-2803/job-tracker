import { Queue } from "bullmq";
import { redis } from "./redis";

export const SCRAPER_QUEUE_NAME = "job-scraper-queue";

// This is the queue instance that our Next.js API routes will use to push jobs
export const scraperQueue = new Queue(SCRAPER_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: "exponential",
      delay: 2000, // Wait 2s, then 4s, then 8s before retrying
    },
    removeOnComplete: 100, // Keep the last 100 successful jobs for debugging
    removeOnFail: 50, // Keep the last 50 failed jobs for debugging
  },
});
