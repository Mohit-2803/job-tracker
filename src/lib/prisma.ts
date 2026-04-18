import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse existing instance if available, otherwise create a new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In dev, hot reload would create a new PrismaClient on every file save
// — storing it on globalThis prevents connection pool exhaustion
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
