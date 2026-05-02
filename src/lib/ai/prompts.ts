export function buildResumeExtractionPrompt(rawText: string): string {
  return `You are an expert resume parser. Extract ALL available information from the resume text below into the exact JSON structure shown.

Expected JSON structure (all fields optional — omit if not found):
{
  "name": "string — full name of the candidate",
  "email": "string — email address (contains @)",
  "phone": "string — phone number, may include country code like +91",
  "location": "string — city and state/country as plain text, e.g. 'Bhuj, Gujarat'",
  "linkedin": "string — full LinkedIn URL",
  "summary": "string — professional summary or 'About Me' paragraph from the resume",
  "skills": ["string", "string"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string — exact date as written, e.g. 'June 2005'",
      "endDate": "string — exact date as written, or 'Current' / 'Present'",
      "description": "string — 1-2 sentence summary of responsibilities"
    }
  ],
  "education": [
    {
      "institution": "string — school or university name",
      "degree": "string — degree name",
      "startDate": "string — optional",
      "endDate": "string — graduation date"
    }
  ],
  "projects": [
    {
      "name": "string — project name",
      "description": "string — 1-2 sentence summary of what the project does",
      "technologies": ["string — tech/tool used"],
      "link": "string — GitHub or live URL if present"
    }
  ],
  "certifications": ["string — certification name"],
  "languages": ["string — language name"]
}

Rules:
- Extract EVERY field that has corresponding data in the resume — do not leave fields empty if the data is present.
- A resume almost always has work experience and education — look carefully in sections titled "Work Experience", "Experience", "Employment", "Education", "Academic Background".
- Projects often appear in sections titled "Projects", "Personal Projects", "Side Projects", or "Portfolio". Extract each as a separate entry. The "technologies" array should be the tech stack mentioned for that project.
- If there is an "About Me", "Summary", "Objective", or "Profile" section, extract the full paragraph-style narrative (2-5 sentences) into the summary field — not just a short phrase. If the section header is followed by personal info (phone/email) first and then a longer paragraph, take the paragraph.
- Extract phone numbers even if they appear mixed with other text (e.g. on the same line as experience).
- Extract emails by scanning for "@" anywhere in the document.
- For dates in experience/education, keep them as plain strings exactly as written (e.g. "June 2005 – Current", "March 1999").
- Location should be a plain string like "Bhuj, Gujarat", never a nested object.
- Skills are individual items — "MS Office, Excel, Word" should become three entries.
- Never fabricate data. If a field genuinely is not in the resume, omit it.
- Always respond in English.
- Return ONLY the JSON object, no surrounding text.

Resume text:
${rawText}`;
}

export function buildJobExtractionPrompt(rawText: string): string {
  return `You are an expert job description parser. Extract ALL available information from the raw webpage text below into the exact JSON structure shown. 

CRITICAL RULES:
1. Ignore "Similar Jobs", "Other roles you might like", "Company Privacy Policy", and any website navigation noise. Focus strictly on the primary job description.
2. Skill Normalization: Normalize all skill names to their most common industry standard (e.g., 'JS' -> 'JavaScript', 'AWS' -> 'Amazon Web Services', 'React.js' -> 'React').
3. Do not hallucinate or make up data. If a field is missing, omit it or use 'Unknown'.

Expected JSON structure:
{
  "_thought_process": "string — Think step-by-step. Identify the actual job title, find the core requirements, filter out website noise, and list the skills to normalize.",
  "jobTitle": "string — the exact job title",
  "jobDescription": "string — a highly readable Markdown formatted version of the core job description. Separate it into '## About the Role', '## Responsibilities' (bullet points), and '## Requirements' (bullet points). Do NOT include company overview here.",
  "extractedSkills": ["string", "string"] — an array of normalized required/preferred skills,
  "companyName": "string — the name of the hiring company",
  "jobLocation": "string — location (optional)",
  "salaryRange": "string — salary or compensation range if mentioned (optional)",
  "workModel": "string — strictly one of: 'Remote', 'Hybrid', 'On-site', or 'Unknown'",
  "employmentType": "string — e.g. 'Full-time', 'Contract', 'Internship' (optional)",
  "yearsOfExperience": "string — e.g. '3+ years', 'Entry-level' (optional)",
  "rawCompanyContext": "string — If you see an 'About the Company' or 'Company Overview' section in the raw text, extract the first 2-3 sentences here. This is critical for identifying the company correctly."
}

Raw Page Text:
${rawText}`;
}

export function buildCompanyResearchPrompt(
  companyName: string,
  context?: string,
): string {
  const contextSection = context
    ? `\nCONTEXT FROM JOB POSTING (Use this to accurately identify the company):\n${context}\n`
    : "";

  return `You are an expert corporate researcher and investment analyst. I need a highly accurate, brief research summary about the company "${companyName}".
${contextSection}
Please provide the information in the exact JSON structure shown below. 

CRITICAL RULES:
1. Think Step-by-Step: Use the '_thought_process' field to analyze the company name and any provided context. If the context mentions specific products (like jewelry, software, or health), prioritize that over your general knowledge.
2. High-Quality Summary: The 'about' section must be a highly professional 1-3 sentence summary of the company's core product, mission, and target market.
3. Reasonable Estimates: Estimate their employee size, funding stage, industry, and headquarters based on your training data and the provided context. 
4. Graceful Degradation: If it is a very obscure company or you have absolutely no data, make your best educated guess based on the name and context, or return "Unknown".

Expected JSON structure:
{
  "_thought_process": "string — Analyze the company name and context, recall its business model, and estimate its scale.",
  "name": "string — the actual company name (normalized)",
  "about": "string — a brief 1-3 sentence professional summary of what the company does",
  "size": "string — e.g. '1-50', '50-200', '1,000+', or 'Unknown'",
  "funding": "string — e.g. 'Seed', 'Series A-C', 'Public', 'Bootstrapped', or 'Unknown'",
  "industry": "string — e.g. 'B2B SaaS', 'Fintech', 'Healthcare', 'AI/ML'",
  "founded": "string — the year they were founded (optional)",
  "headquarters": "string — the city and country (optional)"
}
`;
}
