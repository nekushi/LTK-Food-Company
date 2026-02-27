"use server";

import prisma from "@/lib/db";

export async function getCurrentUser(userId: string) {
  if (!userId) {
    return { firstName: "", lastName: "", username: "", role: "" };
  }

  const account = await prisma.account.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, username: true, role: true },
  });

  if (!account) {
    return { firstName: "", lastName: "", username: "", role: "" };
  }

  return {
    firstName: account.firstName,
    lastName: account.lastName,
    username: account.username,
    role: account.role,
  };
}
