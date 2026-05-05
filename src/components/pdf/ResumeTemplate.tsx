import type { CommittedTailoredResume } from "@/components/applications/tailor/tailorReducer";
import type { ParsedResume } from "@/lib/ai/schema";

// Print-optimized resume template. Designed for A4 (794×1123 @ 96dpi).
// Conservative typography, generous line-height, no app chrome — what the
// recruiter sees in the PDF must look identical to a polished Word doc.
//
// Tailwind utilities work because the print page imports globals.css; Playwright's
// `printBackground: true` keeps colors and dividers visible.

// Most recruiters scan the first ~12 skills; beyond that the rest goes unread
// and just inflates page height. The committed.skillsOrder is already AI-prioritized
// (JD-matching first), so the top N are the highest-signal ones for this role.
const MAX_VISIBLE_SKILLS = 18;

type Props = {
  parsedResume: ParsedResume;       // source of truth for contact info, education, projects
  committed: CommittedTailoredResume; // tailored summary + experience for THIS application
};

export function ResumeTemplate({ parsedResume, committed }: Props) {
  return (
    // No outer padding — Playwright owns per-page margins (see render.ts).
    // text-[10.5px] is the sweet spot for resume body type: dense without straining.
    <div className="bg-white text-zinc-900 leading-relaxed text-[10.5px]">
      {/* Header — break-inside-avoid keeps name/contact together if a page break
          ever happens after only the name (defensive, header is small). */}
      <header className="break-inside-avoid border-b border-zinc-300 pb-3 mb-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {parsedResume.name ?? "Untitled"}
        </h1>
        <ContactLine
          email={parsedResume.email}
          phone={parsedResume.phone}
          location={parsedResume.location}
          linkedin={parsedResume.linkedin}
        />
      </header>

      {/* Summary — comes from the committed (tailored) version */}
      {committed.summary && (
        <Section title="Summary">
          <p className="text-zinc-700 leading-relaxed">{committed.summary}</p>
        </Section>
      )}

      {/* Skills — committed.skillsOrder puts JD-matching skills first; we cap
          silently because beyond ~18 the rest is noise on a recruiter's first scan. */}
      {committed.skillsOrder.length > 0 && (
        <Section title="Skills">
          <p className="text-zinc-700">
            {committed.skillsOrder.slice(0, MAX_VISIBLE_SKILLS).join(" · ")}
          </p>
        </Section>
      )}

      {/* Experience — committed entries (each description is the user's chosen version) */}
      {committed.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {committed.experience.map((entry, i) => (
              <div
                key={`${entry.company}-${entry.role}-${i}`}
                className="break-inside-avoid"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-zinc-900">{entry.role}</h3>
                    <p className="text-zinc-700">{entry.company}</p>
                  </div>
                  {/* Plain hyphen instead of en-dash — some legacy ATS choke on
                      en-dash (U+2013), and recruiters paste resume text into other
                      tools. Conservative wins here. */}
                  <p className="text-zinc-500 text-[10px] whitespace-nowrap">
                    {entry.startDate ?? ""}
                    {entry.endDate ? ` - ${entry.endDate}` : ""}
                  </p>
                </div>
                <p className="mt-1 text-zinc-700 whitespace-pre-wrap">
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Projects — comes from parsedResume (untailored — projects are facts not framing) */}
      {parsedResume.projects && parsedResume.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-2">
            {parsedResume.projects.map((p, i) => (
              <div key={i} className="break-inside-avoid">
                <h3 className="font-semibold text-zinc-900">{p.name}</h3>
                {p.description && (
                  <p className="text-zinc-700 mt-0.5">{p.description}</p>
                )}
                {p.technologies && p.technologies.length > 0 && (
                  <p className="text-zinc-500 text-[10px] mt-0.5">
                    {p.technologies.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {parsedResume.education && parsedResume.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-1.5">
            {parsedResume.education.map((e, i) => (
              <div
                key={i}
                className="break-inside-avoid flex items-baseline justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-zinc-900">
                    {e.degree ?? ""}
                  </h3>
                  <p className="text-zinc-700">{e.institution ?? ""}</p>
                </div>
                <p className="text-zinc-500 text-[10px] whitespace-nowrap">
                  {e.endDate ?? e.startDate ?? ""}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications + Languages — compact tail */}
      {parsedResume.certifications && parsedResume.certifications.length > 0 && (
        <Section title="Certifications">
          <p className="text-zinc-700">
            {parsedResume.certifications.join(" · ")}
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3">
      {/* break-after-avoid prevents the orphan-heading case (where a section
          header lands at the bottom of a page and its content moves to the
          next page). It does NOT force the whole section to stay together —
          large sections like Experience can still split between entries. */}
      <h2 className="break-after-avoid text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 border-b border-zinc-200 pb-0.5 mb-1.5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContactLine({
  email,
  phone,
  location,
  linkedin,
}: {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}) {
  const items = [email, phone, location, linkedin].filter(Boolean) as string[];
  if (items.length === 0) return null;
  return (
    <p className="text-[10.5px] text-zinc-600 mt-1.5">{items.join(" · ")}</p>
  );
}
