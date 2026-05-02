export function calculateMatchScore(
  jobSkills: string[],
  resumeSkills: string[],
): number {
  if (!jobSkills.length) return 0;
  if (!resumeSkills.length) return 0;

  const normalizedResumeSkills = resumeSkills.map((s) =>
    s.toLowerCase().trim(),
  );

  let matches = 0;
  for (const skill of jobSkills) {
    if (normalizedResumeSkills.includes(skill.toLowerCase().trim())) {
      matches++;
    }
  }

  return Math.round((matches / jobSkills.length) * 100);
}
