import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

type DepStatus = "up" | "down";

async function checkPrisma(): Promise<DepStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "up";
  } catch {
    return "down";
  }
}

async function checkRedis(): Promise<DepStatus> {
  try {
    const pong = await redis.ping();
    return pong === "PONG" ? "up" : "down";
  } catch {
    return "down";
  }
}

export async function GET() {
  const [db, cache] = await Promise.all([checkPrisma(), checkRedis()]);
  const allUp = db === "up" && cache === "up";

  return NextResponse.json(
    {
      status: allUp ? "ok" : "degraded",
      checks: { db, cache },
      timestamp: new Date().toISOString(),
    },
    { status: allUp ? 200 : 503 },
  );
}
