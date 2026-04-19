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
