import Groq from "groq-sdk";
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

export async function extractResumeData(rawText: string): Promise<ParsedResume> {
  const cleanedText = cleanResumeText(rawText);

  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: buildResumeExtractionPrompt(cleanedText) }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = ResumeSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : (JSON.parse(raw) as ParsedResume);
}
