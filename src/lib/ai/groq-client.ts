import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "@/env";
import { ResumeSchema, type ParsedResume } from "./schema";
import { buildResumeExtractionPrompt } from "./prompts";

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

function buildCorrectivePrompt(originalPrompt: string, error: z.ZodError): string {
  const issues = error.issues
    .map((i) => `- path: ${i.path.join(".") || "(root)"} — ${i.message}`)
    .join("\n");

  return `${originalPrompt}

YOUR PREVIOUS RESPONSE FAILED VALIDATION. Fix these issues and return STRICTLY valid JSON matching the schema:
${issues}`;
}

export async function extractResumeData(rawText: string): Promise<ParsedResume> {
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
