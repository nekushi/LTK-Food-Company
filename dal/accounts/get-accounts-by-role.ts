"use server";

import prisma from "@/lib/db";


export async function getAccountsByRole(roles: string | string[]) {
  try {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const accounts = await prisma.account.findMany({
      where: {
        role: { in: roleArray as any },
      },
      orderBy: {
        firstName: "asc",
      },
    });
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts by role:", error);
    return [];
  }
}

export async function getAccountById(id: string) {
  try {
    return await prisma.account.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return null;
  }
}
