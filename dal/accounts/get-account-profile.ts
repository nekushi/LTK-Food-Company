"use server";

import prisma from "@/lib/db";

export async function getAccountProfile(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, account: null, employeeData: null };
    }

    const employee = await prisma.employee.findFirst({
      where: {
        firstName: account.firstName,
        lastName: account.lastName,
      },
      include: {
        employeeData: true,
        employeeWorkData: true,
      },
    });

    return {
      success: true,
      account: {
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        username: account.username,
        role: account.role,
      },
      employeeData: employee?.employeeData ?? null,
      employeeWorkData: employee?.employeeWorkData ?? null,
      employeeId: employee?.employeeId ?? null,
    };
  } catch (error) {
    console.error(error);
    return { success: false, account: null, employeeData: null };
  }
}
