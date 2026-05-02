import { GenericScraper } from "./generic";
import { JobExtractData } from "./types";
import { extractJobData } from "@/lib/ai/groq-client";

export class NaukriScraper extends GenericScraper {
  async scrapeJob(url: string): Promise<JobExtractData> {
    const rawText = await this.withBrowser(
      url,
      async (page) => {
        console.log(`[NaukriScraper] Visiting: ${url}`);

        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

        // Wait for real content to appear
        await page
          .waitForFunction(
            () => document.body.innerText.length > 1200,
            { timeout: 15000 },
          )
          .catch(() =>
            console.log(
              "[NaukriScraper] Wait timed out, proceeding with what we have.",
            ),
          );

        // Grab the FULL page text — the AI needs the header (company, title, salary)
        // not just the JD body section
        return await page.evaluate(() => (document.body as any).innerText || "");
      },
      // Context options
      { viewport: { width: 1280, height: 1000 } },
      // Launch options — use the REAL installed Chrome to bypass Akamai TLS fingerprinting
      { channel: "chrome" },
    );

    console.log(
      `[NaukriScraper] Final Extracted text length: ${rawText.length}`,
    );
    console.log(
      `[NaukriScraper] DEBUG — First 500 chars:\n${rawText.substring(0, 500)}`,
    );
    return await extractJobData(rawText);
  }
}
