import { ScraperAdapter } from "./types";
import { GenericScraper } from "./generic";
import { LinkedInScraper } from "./linkedin";

export function getScraperForUrl(url: string): ScraperAdapter {
  if (url.includes("linkedin.com")) {
    return new LinkedInScraper();
  }
  return new GenericScraper();
}
