import { GenericScraper } from "./generic";

export class LinkedInScraper extends GenericScraper {
  async scrapeJob(url: string) {
    let finalUrl = url;

    // Intercept search URLs
    console.log("DEBUG: LinkedInScraper received URL:", url)
    if (url.includes("linkedin.com") && url.includes("currentJobId=")) {
      const urlObj = new URL(url);
      const jobId = urlObj.searchParams.get("currentJobId");
      if (jobId) {
        finalUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
        console.log(
          `[LinkedInScraper] Converted search URL to direct job URL: ${finalUrl}`,
        );
      }
    }

    // Call the generic Playwright logic with the clean URL
    return super.scrapeJob(finalUrl);
  }
}
