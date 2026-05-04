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
  workModel: z
    .enum(["Remote", "Hybrid", "On-site", "Unknown"])
    .default("Unknown"),
  employmentType: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  rawCompanyContext: z.string().optional(),
});

export type ParsedJobExtract = z.infer<typeof JobExtractSchema>;

export const CompanyResearchSchema = z.object({
  _thought_process: z.string(),
  name: z.string(),
  about: z.string().optional(),
  size: z.string().optional(),
  funding: z.string().optional(),
  industry: z.string().optional(),
  founded: z.string().optional(),
  headquarters: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  keyValueProposition: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  signals: z
    .object({
      greenFlags: z.array(z.string()).optional(),
      redFlags: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ParsedCompanyResearch = z.infer<typeof CompanyResearchSchema>;

export const MatchScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
  topMissingSkills: z.array(z.string()).optional(),
  proTip: z.string().optional(),
});

export type ParsedMatchScore = z.infer<typeof MatchScoreSchema>;

export const TailoredResumeSchema = z.object({
  _thought_process: z.string(),
  originalSummary: z.string().optional(),
  tailoredSummary: z.string(),
  summaryChanged: z.boolean(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      originalDescription: z.string(),
      tailoredDescription: z.string(),
      changed: z.boolean(),
      rationale: z.string().optional(),
    }),
  ),
  skillsOrder: z.array(z.string()),
  emphasizedSkills: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
});

export type ParsedTailoredResume = z.infer<typeof TailoredResumeSchema>;

export const CoverLetterSchema = z.object({
  _thought_process: z.string(),
  coverLetter: z.string(),
  toneNotes: z.string().optional(),
});

export type ParsedCoverLetter = z.infer<typeof CoverLetterSchema>;

// Shape committed to the database when the user saves their accept/reject decisions.
// Mirrors `CommittedTailoredResume` in tailorReducer.ts but lives here so the API route
// can validate inbound JSON without importing client-only code.
export const CommittedTailoredResumeSchema = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string(),
    }),
  ),
  skillsOrder: z.array(z.string()),
  emphasizedSkills: z.array(z.string()),
});

export type CommittedTailoredResumeInput = z.infer<
  typeof CommittedTailoredResumeSchema
>;
