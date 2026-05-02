import { z } from "zod";

export const ResumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        institution: z.string().optional(),
        degree: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        link: z.string().optional(),
      }),
    )
    .optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type ParsedResume = z.infer<typeof ResumeSchema>;

export const JobExtractSchema = z.object({
  _thought_process: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  extractedSkills: z.array(z.string()),
  companyName: z.string(),
  jobLocation: z.string().optional(),
  salaryRange: z.string().optional(),
  workModel: z.enum(["Remote", "Hybrid", "On-site", "Unknown"]).default("Unknown"),
  employmentType: z.string().optional(),
  yearsOfExperience: z.string().optional(),
});

export type ParsedJobExtract = z.infer<typeof JobExtractSchema>;
