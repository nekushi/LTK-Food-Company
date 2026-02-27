"use server";

import prisma from "@/lib/db";

/** Current user's store (for store role). Returns null if not a store user. */
export async function getCurrentStore(userId: string): Promise<{ id: string } | null> {
  if (!userId) return null;

  const store = await prisma.store.findUnique({
    where: { userId },
    select: { id: true },
  });

  return store;
}
