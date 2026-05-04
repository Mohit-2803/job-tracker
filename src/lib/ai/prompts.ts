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
  "companyName": "string — the name of the hiring company. On Indian job portals like Naukri, look for text like 'Posted by X' or the company name near the job title header. If a recruitment agency posted the job, use the agency name (e.g., 'Creative Hands HR'). Never return 'Unknown' if any company or agency name is visible on the page.",
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
5. Ground Truth: If the provided CONTEXT FROM JOB POSTING conflicts with your internal training data, prioritize the context.
6. Zero Jargon: Avoid corporate "fluff" like 'innovative', 'world-class', 'leveraging', or 'synergy'. Be concrete about products and business models.

Expected JSON structure:
{
  "_thought_process": "string — Analyze the company name and context, recall its business model, and estimate its scale.",
  "name": "string — the actual company name (normalized)",
  "about": "string — a brief 1-3 sentence professional summary of what the company does",
  "size": "string — e.g. '1-50', '50-200', '1,000+', or 'Unknown'",
  "funding": "string — e.g. 'Seed', 'Series A-C', 'Public', 'Bootstrapped', or 'Unknown'",
  "industry": "string — e.g. 'B2B SaaS', 'Fintech', 'Healthcare', 'AI/ML'",
  "founded": "string — the year they were founded (optional)",
  "headquarters": "string — the city and country (optional)",
  "techStack": ["string — key technologies they use, especially those mentioned in the job context"],
  "keyValueProposition": "string — a 1-sentence 'hook' on why a developer would want to work there",
  "competitors": ["string — names of 2-3 main competitors in their space"],
  "confidenceScore": "number (0-100) — How sure are you about this data? 90+ if you know the brand well, 50 if you are guessing from context.",
  "signals": {
    "greenFlags": ["string — e.g. 'Strong funding', 'Modern tech', 'Remote-first'"],
    "redFlags": ["string — e.g. 'Vague requirements', 'Legacy tech', 'High turnover signals'"]
  }
}
`;
}

export function buildResumeTailoringPrompt(
  parsedResume: unknown,
  jobTitle: string,
  extractedSkills: string[],
  jobDescription?: string,
  companyContext?: string,
): string {
  const jdSection = jobDescription
    ? `\nJOB DESCRIPTION (excerpt):\n${jobDescription.substring(0, 3000)}\n`
    : "";
  const companySection = companyContext
    ? `\nCOMPANY CONTEXT:\n${companyContext.substring(0, 800)}\n`
    : "";

  return `You are an elite resume strategist. Your job is to TAILOR a candidate's existing resume to a specific role — emphasizing the experience and skills that align with the job — without ever inventing facts.

JOB TITLE: ${jobTitle}
JOB REQUIRED SKILLS: ${extractedSkills.join(", ")}
${jdSection}${companySection}
CANDIDATE RESUME (JSON):
${JSON.stringify(parsedResume, null, 2)}

ABSOLUTE RULES (violating any of these is a failure):
1. NEVER FABRICATE. Do not invent companies, roles, dates, technologies, projects, or accomplishments that are not already present in the candidate's resume above.
2. NEVER ADD SKILLS the candidate does not already list. You may REORDER and EMPHASIZE; you may not invent.
3. If the candidate lacks a critical job skill, do NOT pretend they have it. Instead, add an entry to "warnings" explaining the gap honestly.
4. You MAY rephrase descriptions to use the language of the JD (e.g. if the candidate wrote "made a website with React" and the JD asks for "frontend engineering", you may rewrite as "Engineered a frontend application using React"). The underlying fact must remain true.
5. You MAY reorder the skills list to put job-matching skills first.
6. Preserve every experience entry — do not delete past roles even if irrelevant. You may shorten irrelevant ones.
7. Set "changed: false" and copy the original verbatim into "tailoredDescription" if no change was warranted for that entry.

OUTPUT JSON STRUCTURE:
{
  "_thought_process": "string — Step-by-step: which JD skills does the candidate already have? Which experience entries can be re-emphasized to highlight those skills? What gaps must I flag honestly?",
  "originalSummary": "string — The candidate's existing summary, copied verbatim. Empty string if none exists.",
  "tailoredSummary": "string — A rewritten 2-4 sentence professional summary emphasizing alignment with the job. If no original existed, write one using ONLY facts from their experience and skills.",
  "summaryChanged": "boolean — true if tailoredSummary differs from originalSummary",
  "experience": [
    {
      "company": "string — copied from input",
      "role": "string — copied from input",
      "startDate": "string — copied from input",
      "endDate": "string — copied from input",
      "originalDescription": "string — copied verbatim from the input resume",
      "tailoredDescription": "string — rewritten to emphasize job-relevant skills, OR identical to originalDescription if no change needed",
      "changed": "boolean — true if tailoredDescription differs from originalDescription",
      "rationale": "string — 1 sentence explaining why this entry was rewritten (or why it wasn't). Required when changed=true."
    }
  ],
  "skillsOrder": ["string — the candidate's full skill list, reordered so job-matching skills come first. Do NOT add new skills."],
  "emphasizedSkills": ["string — the 3-7 skills from the candidate's list that are most relevant to this job"],
  "warnings": ["string — honest gaps the candidate should know about, e.g. 'JD requires Kubernetes; candidate has no container experience listed'"]
}

Return ONLY the JSON object. No prose, no markdown fencing.`;
}

export function buildCoverLetterPrompt(
  parsedResume: unknown,
  jobTitle: string,
  companyName: string,
  extractedSkills: string[],
  companyResearch?: unknown,
  jobDescription?: string,
): string {
  const researchSection = companyResearch
    ? `\nCOMPANY RESEARCH (use specific details from this — funding stage, mission, products):\n${JSON.stringify(companyResearch, null, 2).substring(0, 1500)}\n`
    : "";
  const jdSection = jobDescription
    ? `\nJOB DESCRIPTION (excerpt):\n${jobDescription.substring(0, 2000)}\n`
    : "";

  return `You are an expert cover-letter writer. Write a personalized, concise cover letter for the candidate below targeting this specific role and company.

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}
JOB REQUIRED SKILLS: ${extractedSkills.join(", ")}
${jdSection}${researchSection}
CANDIDATE RESUME (JSON):
${JSON.stringify(parsedResume, null, 2)}

ABSOLUTE RULES:
1. NEVER fabricate experience, skills, or projects the candidate does not have.
2. Reference at least one SPECIFIC detail about the company — its funding stage, products, mission, or recent news — drawn from the COMPANY RESEARCH section. Do NOT use generic praise like "innovative" or "industry-leading".
3. Connect 2-3 of the candidate's REAL accomplishments directly to the job's requirements.
4. Length: 250-350 words. 3-4 short paragraphs. No filler.
5. Tone: confident, specific, professional. Avoid "I am writing to express my interest" boilerplate.
6. Do NOT include the date, address blocks, or "Dear Hiring Manager" salutation — start directly with the opening line. The candidate will add formal headers themselves.

OUTPUT JSON STRUCTURE:
{
  "_thought_process": "string — Which company details did I find that I can reference specifically? Which 2-3 candidate accomplishments map best to the role?",
  "coverLetter": "string — The cover letter body in plain text with paragraph breaks via \\n\\n. Markdown is allowed for emphasis but not required.",
  "toneNotes": "string — 1 sentence on the tone chosen and why (e.g. 'Confident and technical, matching the company's engineering-focused brand')."
}

Return ONLY the JSON object.`;
}

export function buildMatchScorePrompt(
  jobSkills: string[],
  resumeSkills: string[],
  jobTitle: string,
  candidateSummary?: string,
  yearsOfExperience?: string,
): string {
  const seniorityContext = yearsOfExperience 
    ? `JOB SENIORITY REQUIREMENT: ${yearsOfExperience}\n`
    : "";
  
  const candidateContext = candidateSummary
    ? `CANDIDATE PROFILE SUMMARY: ${candidateSummary}\n`
    : "";

  return `You are an elite Tech Career Coach and HR Expert. Your task is to calculate a "Match Score" between a Job and a Candidate.

JOB TITLE: ${jobTitle}
${seniorityContext}
REQUIRED SKILLS: ${jobSkills.join(", ")}

${candidateContext}
CANDIDATE SKILLS: ${resumeSkills.join(", ")}

SCORING WEIGHTS:
- 60% Core Technical Match (Languages, Frameworks, Core Tech)
- 30% Seniority & Experience Match (Years of exp, leadership, complexity of past work)
- 10% Nice-to-haves (Tools, soft skills, secondary tech)

CRITICAL RULES:
1. Semantic Matching: Do not just look for exact word matches. Understand that "React" implies "JavaScript", "FastAPI" implies "Python", and "Postgres" implies "SQL".
2. Seniority Check: If the candidate profile suggests they are too junior for a senior role, penalize the score significantly.
3. Quality Over Quantity: 5 years of deep React experience is worth more than 1 month of 10 different frameworks.
4. Strategy: Identify the top missing skills and provide a "Pro Tip" for the candidate.

Expected JSON structure:
{
  "score": number (0-100),
  "reasoning": "string",
  "topMissingSkills": ["string — top 3 missing critical skills"],
  "proTip": "string — Actionable advice to bridge the gap or ace the interview"
}
`;
}
