"use server";

import prisma from "@/lib/db";

export async function getAccounts() {
  const accounts = await prisma.account.findMany();
  return accounts;
}
