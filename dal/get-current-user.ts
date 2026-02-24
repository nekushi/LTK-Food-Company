"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function getCurrentUser() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return { firstName: "", lastName: "", role: "" };
  }

  const account = await prisma.account.findUnique({
    where: { id: payload.userId as string },
    select: { firstName: true, lastName: true, role: true },
  });

  if (!account) {
    return { firstName: "", lastName: "", role: payload.role as string };
  }

  return {
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
  };
}
