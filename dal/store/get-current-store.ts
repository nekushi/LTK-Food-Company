"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

/** Current user's store (for store role). Returns null if not a store user. */
export async function getCurrentStore(): Promise<{ id: string } | null> {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) return null;

  const store = await prisma.store.findUnique({
    where: { userId: payload.userId as string },
    select: { id: true },
  });

  return store;
}
