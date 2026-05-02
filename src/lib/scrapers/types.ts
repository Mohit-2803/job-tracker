export interface CompanyResearchData {
  name: string;
  about?: string;
  size?: string;
  funding?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  techStack?: string[];
  keyValueProposition?: string;
  competitors?: string[];
  confidenceScore?: number;
  signals?: {
    greenFlags?: string[];
    redFlags?: string[];
  };
}

export interface JobExtractData {
  jobTitle: string;
  jobDescription: string;
  extractedSkills: string[];
  companyName: string;
  jobLocation?: string;
  salaryRange?: string;
  workModel?: string;
  employmentType?: string;
  yearsOfExperience?: string;
  rawCompanyContext?: string;
}

export interface ScraperAdapter {
  /**
   * Scrape a job description URL and return structured data
   */
  scrapeJob(url: string): Promise<JobExtractData>;

  /**
   * Scrape a company's profile/domain and return structured research
   */
  researchCompany(companyNameOrDomain: string, context?: string): Promise<CompanyResearchData>;
}
