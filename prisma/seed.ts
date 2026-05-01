/**
 * Local dev seed script.
 *
 * Run with:  npx prisma db seed
 *
 * Reads SEED_USER_ID from .env — that's YOUR User.id from the dev DB.
 * Refuses to run when NODE_ENV=production. Wipes seeded rows first so you
 * can re-run it idempotently without piling up duplicates.
 */

import { PrismaClient, AppStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

// ─────────────────────────────────────────────────────────────────────────────
// Safety guard — never run against production
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script blocked in production");
}

if (!process.env.SEED_USER_ID) {
  throw new Error(
    "SEED_USER_ID missing from .env — paste your User.id from `npx prisma studio`",
  );
}
const SEED_USER_ID: string = process.env.SEED_USER_ID;

// Bypass the soft-delete extension — seed needs raw access
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Tunables
// ─────────────────────────────────────────────────────────────────────────────
const COMPANY_COUNT = 15;
const APPLICATION_COUNT = 100;

// Realistic funnel weights — most apps sit in APPLIED, very few reach OFFER.
// These should sum to 1.0. Adjust to match a believable applicant funnel.
const STATUS_WEIGHTS: Record<AppStatus, number> = {
  DRAFT: 0.05,
  APPLIED: 0.45,
  IN_REVIEW: 0.2,
  INTERVIEW: 0.15,
  OFFER: 0.03,
  REJECTED: 0.1,
  WITHDRAWN: 0.02,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — TODO #1 for you to implement (see bottom)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO #1 — Weighted random AppStatus picker.
 *
 * Given STATUS_WEIGHTS like { APPLIED: 0.45, IN_REVIEW: 0.2, ... },
 * return a random AppStatus where each value's probability matches its weight.
 *
 * Algorithm hint:
 *   1. Generate r = Math.random()  (uniform 0..1)
 *   2. Walk the entries, accumulating a running sum
 *   3. Return the first key where the running sum >= r
 *
 * In an interview you'd say: "weighted random sample via cumulative-distribution
 * lookup — O(n) per pick, which is fine because n=7." Same algorithm a load
 * balancer uses to pick a backend.
 */
function pickWeightedStatus(): AppStatus {
  const r = Math.random();
  let cumulative = 0;
  for (const [status, weight] of Object.entries(STATUS_WEIGHTS) as [
    AppStatus,
    number,
  ][]) {
    cumulative += weight;
    if (r < cumulative) return status;
  }
  return AppStatus.APPLIED;
}

const SKILL_POOL = [
  "React",
  "TypeScript",
  "Node",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "GraphQL",
  "Next.js",
  "Postgres",
  "Redis",
  "Kubernetes",
];

function randomSalaryRange(): string | null {
  if (Math.random() < 0.3) return null;
  const low = faker.number.int({ min: 5, max: 25 });
  const high = low + faker.number.int({ min: 3, max: 15 });
  return `₹${low}L–${high}L`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding…");

  // Confirm the user exists so we fail fast with a clear message
  const user = await prisma.user.findUnique({ where: { id: SEED_USER_ID } });
  if (!user) {
    throw new Error(
      `User ${SEED_USER_ID} not found. Log in at least once, then update SEED_USER_ID in .env.`,
    );
  }
  console.log(`   user: ${user.email}`);

  // ──────────────────────────────────────────────────────────────────────────
  // Wipe seeded data only — leave User/Account/Session/Resume untouched
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.application.deleteMany({ where: { userId: SEED_USER_ID } });
  await prisma.company.deleteMany({});
  console.log("   wiped existing seed data");

  // ──────────────────────────────────────────────────────────────────────────
  // Seed companies
  // ──────────────────────────────────────────────────────────────────────────
  const companies = await Promise.all(
    Array.from({ length: COMPANY_COUNT }, () => {
      const name = faker.company.name();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return prisma.company.create({
        data: {
          name,
          domain: `${slug}-${faker.string.alphanumeric(4)}.com`,
          linkedinUrl: `https://linkedin.com/company/${slug}`,
        },
      });
    }),
  );
  console.log(`   created ${companies.length} companies`);

  // ──────────────────────────────────────────────────────────────────────────
  // Seed applications — TODO #2 for you
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * TODO #2 — Create APPLICATION_COUNT applications.
   *
   * For each one:
   *   - userId:          SEED_USER_ID
   *   - companyId:       random company from `companies` (faker.helpers.arrayElement)
   *   - resumeId:        null (we're not faking resumes)
   *   - jobUrl:          faker.internet.url()
   *   - jobTitle:        faker.person.jobTitle()
   *   - jobLocation:     faker.location.city() + ", " + faker.location.country()
   *   - salaryRange:     something like "₹8L–12L" or null sometimes
   *   - jobDescription:  faker.lorem.paragraphs(3)  ← realistic length, not 1 line
   *   - extractedSkills: { skills: faker.helpers.arrayElements(["React","TypeScript","Node","Python","SQL","AWS","Docker","GraphQL"], { min: 3, max: 6 }) }
   *   - matchScore:      faker.number.float({ min: 0.4, max: 0.95, fractionDigits: 2 })
   *   - tailoredResume:  null
   *   - coverLetter:     null
   *   - status:          pickWeightedStatus()
   *   - appliedAt:       random Date in the last 90 days (faker.date.recent({ days: 90 }))
   *   - createdAt:       same as appliedAt (or slightly before — your call)
   *
   * Performance hint: `Promise.all(Array.from(...).map(...))` parallelises the
   * inserts. For 100 rows it doesn't matter, but it's good muscle memory.
   *
   * Interview framing: "we used parallel inserts via Promise.all because the
   * Prisma client multiplexes onto the connection pool — sequential awaits
   * would be O(n) round-trip latency, parallel is O(1) bounded by pool size."
   */

  const applications = await Promise.all(
    Array.from({ length: APPLICATION_COUNT }, () => {
      const company = faker.helpers.arrayElement(companies);
      const appliedAt = faker.date.recent({ days: 90 });
      return prisma.application.create({
        data: {
          userId: SEED_USER_ID,
          companyId: company.id,
          resumeId: null,
          jobUrl: faker.internet.url(),
          jobTitle: faker.person.jobTitle(),
          jobLocation: `${faker.location.city()}, ${faker.location.country()}`,
          salaryRange: randomSalaryRange(),
          jobDescription: faker.lorem.paragraphs(3),
          extractedSkills: {
            skills: faker.helpers.arrayElements(SKILL_POOL, {
              min: 3,
              max: 6,
            }),
          },
          matchScore: faker.number.float({
            min: 0.4,
            max: 0.95,
            fractionDigits: 2,
          }),
          tailoredResume: null,
          coverLetter: null,
          status: pickWeightedStatus(),
          appliedAt,
          createdAt: appliedAt,
        },
      });
    }),
  );
  console.log(`   created ${applications.length} applications`);

  console.log("✅ Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
