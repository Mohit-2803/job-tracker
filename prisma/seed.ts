/**
 * Local dev seed script. Run with: `npx prisma db seed`
 * Reads SEED_USER_ID from .env. Refuses to run when NODE_ENV=production.
 * Idempotent — wipes seeded rows before re-inserting.
 */

import { PrismaClient, AppStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script blocked in production");
}

if (!process.env.SEED_USER_ID) {
  throw new Error(
    "SEED_USER_ID missing from .env — paste your User.id from `npx prisma studio`",
  );
}
const SEED_USER_ID: string = process.env.SEED_USER_ID;

const prisma = new PrismaClient();

const COMPANY_COUNT = 15;
const APPLICATION_COUNT = 100;

const STATUS_WEIGHTS: Record<AppStatus, number> = {
  DRAFT: 0.05,
  APPLIED: 0.45,
  IN_REVIEW: 0.2,
  INTERVIEW: 0.15,
  OFFER: 0.03,
  REJECTED: 0.1,
  WITHDRAWN: 0.02,
};

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

function randomSalaryRange(): string | null {
  if (Math.random() < 0.3) return null;
  const low = faker.number.int({ min: 5, max: 25 });
  const high = low + faker.number.int({ min: 3, max: 15 });
  return `₹${low}L–${high}L`;
}

async function main() {
  console.log("🌱 Seeding…");

  const user = await prisma.user.findUnique({ where: { id: SEED_USER_ID } });
  if (!user) {
    throw new Error(
      `User ${SEED_USER_ID} not found. Log in at least once, then update SEED_USER_ID in .env.`,
    );
  }
  console.log(`   user: ${user.email}`);

  await prisma.application.deleteMany({ where: { userId: SEED_USER_ID } });
  await prisma.company.deleteMany({});
  console.log("   wiped existing seed data");

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

  const applications = await Promise.all(
    Array.from({ length: APPLICATION_COUNT }, () => {
      const company = faker.helpers.arrayElement(companies);
      const appliedAt = faker.date.recent({ days: 90 });
      return prisma.application.create({
        data: {
          userId: SEED_USER_ID,
          companyId: company.id,
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
