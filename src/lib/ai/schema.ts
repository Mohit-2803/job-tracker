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
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type ParsedResume = z.infer<typeof ResumeSchema>;
