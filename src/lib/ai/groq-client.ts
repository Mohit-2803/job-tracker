import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "@/env";
import {
  ResumeSchema,
  JobExtractSchema,
  type ParsedResume,
  type ParsedJobExtract,
  CompanyResearchSchema,
  type ParsedCompanyResearch,
  MatchScoreSchema,
  type ParsedMatchScore,
  TailoredResumeSchema,
  type ParsedTailoredResume,
  CoverLetterSchema,
  type ParsedCoverLetter,
} from "./schema";
import {
  buildResumeExtractionPrompt,
  buildJobExtractionPrompt,
  buildCompanyResearchPrompt,
  buildMatchScorePrompt,
  buildResumeTailoringPrompt,
  buildCoverLetterPrompt,
} from "./prompts";

export const groqClient = new Groq({ apiKey: env.GROQ_API_KEY });

function cleanResumeText(text: string): string {
  return text
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +\n/g, "\n")
    .trim();
}

async function callGroq(prompt: string): Promise<string> {
  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });
  return completion.choices[0]?.message?.content ?? "{}";
}

function buildCorrectivePrompt(
  originalPrompt: string,
  error: z.ZodError,
): string {
  const issues = error.issues
    .map((i) => `- path: ${i.path.join(".") || "(root)"} — ${i.message}`)
    .join("\n");

  return `${originalPrompt}

YOUR PREVIOUS RESPONSE FAILED VALIDATION. Fix these issues and return STRICTLY valid JSON matching the schema:
${issues}`;
}

export async function extractResumeData(
  rawText: string,
): Promise<ParsedResume> {
  const cleanedText = cleanResumeText(rawText);
  const prompt = buildResumeExtractionPrompt(cleanedText);

  const firstRaw = await callGroq(prompt);
  const first = ResumeSchema.safeParse(JSON.parse(firstRaw));
  if (first.success) return first.data;

  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, first.error));
  const retry = ResumeSchema.safeParse(JSON.parse(retryRaw));
  if (retry.success) return retry.data;

  throw new Error(
    `Resume extraction failed Zod validation after retry: ${retry.error.message}`,
  );
}

export async function extractJobData(
  rawText: string,
): Promise<ParsedJobExtract> {
  const prompt = buildJobExtractionPrompt(rawText.substring(0, 15000)); // Llama context limit safety

  const firstRaw = await callGroq(prompt);
  const first = JobExtractSchema.safeParse(JSON.parse(firstRaw));
  if (first.success) return first.data;

  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, first.error));
  const retry = JobExtractSchema.safeParse(JSON.parse(retryRaw));
  if (retry.success) return retry.data;

  throw new Error(
    `Job extraction failed Zod validation after retry: ${retry.error.message}`,
  );
}

export async function researchCompanyData(
  companyName: string,
  context?: string,
): Promise<ParsedCompanyResearch> {
  const prompt = buildCompanyResearchPrompt(companyName, context);

  const firstRaw = await callGroq(prompt);
  const first = CompanyResearchSchema.safeParse(JSON.parse(firstRaw));
  if (first.success) return first.data;

  // If the AI messes up the JSON, automatically retry with the corrective prompt!
  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, first.error));
  const retry = CompanyResearchSchema.safeParse(JSON.parse(retryRaw));
  if (retry.success) return retry.data;

  throw new Error(
    `Company research failed Zod validation after retry: ${retry.error.message}`,
  );
}

export async function tailorResumeForJob(
  parsedResume: ParsedResume,
  jobTitle: string,
  extractedSkills: string[],
  jobDescription?: string,
  companyContext?: string,
): Promise<ParsedTailoredResume> {
  const prompt = buildResumeTailoringPrompt(
    parsedResume,
    jobTitle,
    extractedSkills,
    jobDescription,
    companyContext,
  );

  const firstRaw = await callGroq(prompt);
  const first = TailoredResumeSchema.safeParse(JSON.parse(firstRaw));
  if (first.success) return first.data;

  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, first.error));
  const retry = TailoredResumeSchema.safeParse(JSON.parse(retryRaw));
  if (retry.success) return retry.data;

  throw new Error(
    `Resume tailoring failed Zod validation after retry: ${retry.error.message}`,
  );
}

export async function generateCoverLetter(
  parsedResume: ParsedResume,
  jobTitle: string,
  companyName: string,
  extractedSkills: string[],
  companyResearch?: unknown,
  jobDescription?: string,
): Promise<ParsedCoverLetter> {
  const prompt = buildCoverLetterPrompt(
    parsedResume,
    jobTitle,
    companyName,
    extractedSkills,
    companyResearch,
    jobDescription,
  );

  const firstRaw = await callGroq(prompt);
  const first = CoverLetterSchema.safeParse(JSON.parse(firstRaw));
  if (first.success) return first.data;

  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, first.error));
  const retry = CoverLetterSchema.safeParse(JSON.parse(retryRaw));
  if (retry.success) return retry.data;

  throw new Error(
    `Cover letter generation failed Zod validation after retry: ${retry.error.message}`,
  );
}

export async function calculateMatchScoreWithAI(
  jobSkills: string[],
  resumeSkills: string[],
  jobTitle: string,
  candidateSummary?: string,
  yearsOfExperience?: string,
): Promise<ParsedMatchScore> {
  const prompt = buildMatchScorePrompt(
    jobSkills,
    resumeSkills,
    jobTitle,
    candidateSummary,
    yearsOfExperience,
  );

  const raw = await callGroq(prompt);
  const result = MatchScoreSchema.safeParse(JSON.parse(raw));

  if (result.success) return result.data;

  // Simple retry
  const retryRaw = await callGroq(buildCorrectivePrompt(prompt, result.error));
  const retryResult = MatchScoreSchema.safeParse(JSON.parse(retryRaw));

  if (retryResult.success) return retryResult.data;

  throw new Error("AI Scoring failed after retry.");
}
