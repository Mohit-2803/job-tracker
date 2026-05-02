import { chromium, BrowserContextOptions } from "playwright";
import { ScraperAdapter, JobExtractData, CompanyResearchData } from "./types";
import { extractJobData, researchCompanyData } from "@/lib/ai/groq-client";

export class GenericScraper implements ScraperAdapter {
  /**
   * Helper to handle the browser lifecycle (Launch -> Action -> Close)
   * This ensures we never leak memory or leave zombie browsers.
   */
  protected async withBrowser<T>(
    url: string,
    action: (page: any) => Promise<T>,
    options: BrowserContextOptions = {},
    launchOptions: Record<string, any> = {}
  ): Promise<T> {
    const browser = await chromium.launch({ headless: true, ...launchOptions });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ...options,
    });
    const page = await context.newPage();

    try {
      return await action(page);
    } finally {
      await browser.close();
    }
  }

  async scrapeJob(url: string): Promise<JobExtractData> {
    const rawText = await this.withBrowser(url, async (page) => {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      return await page.evaluate(() => document.body.innerText || "");
    });

    console.log(`[GenericScraper] Extracted text length: ${rawText.length}`);
    return await extractJobData(rawText);
  }

  async researchCompany(companyNameOrDomain: string, context?: string): Promise<CompanyResearchData> {
    console.log(`[Research Agent] Investigating company: ${companyNameOrDomain}...`);
    const data = await researchCompanyData(companyNameOrDomain, context);
    return data as CompanyResearchData;
  }
}
