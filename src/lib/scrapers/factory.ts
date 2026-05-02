import { ScraperAdapter } from "./types";
import { GenericScraper } from "./generic";
import { LinkedInScraper } from "./linkedin";
import { NaukriScraper } from "./naukri";

export function getScraperForUrl(url: string): ScraperAdapter {
  if (url.includes("linkedin.com")) {
    return new LinkedInScraper();
  }
  if (url.includes("naukri.com")) {
    return new NaukriScraper();
  }
  return new GenericScraper();
}
