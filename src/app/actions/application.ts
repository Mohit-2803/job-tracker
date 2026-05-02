"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AppStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(id: string, status: AppStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app || app.userId !== session.user.id) {
    throw new Error("Application not found or unauthorized");
  }

  await prisma.application.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
}
