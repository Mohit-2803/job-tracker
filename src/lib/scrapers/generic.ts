import { chromium } from "playwright";
import { ScraperAdapter, JobExtractData, CompanyResearchData } from "./types";
import { extractJobData } from "@/lib/ai/groq-client";

export class GenericScraper implements ScraperAdapter {
  async scrapeJob(url: string): Promise<JobExtractData> {
    // 1. Launch Playwright browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let rawText = "";

    try {
      // 2. Go to the URL and wait for the page to load
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

      // 3. Extract all text content from the <body>
      rawText = await page.evaluate(() => document.body.innerText || "");
    } finally {
      // 4. Close the browser
      await browser.close();
    }

    // 5. Pass the raw text to Groq 
    console.log("Extracted text length:", rawText.length);
    const extractedData = await extractJobData(rawText);
    
    // 6. Return the JobExtractData
    return extractedData;
  }
    async researchCompany(companyNameOrDomain: string): Promise<CompanyResearchData> {
        throw new Error("Method not implemented.");
    }
}