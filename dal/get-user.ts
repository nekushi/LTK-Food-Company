"use server";

import prisma from "@/lib/db";

export async function getAllUsers() {
  const users = await prisma.user.findMany();

  return users;
}

export async function getUser(id: string) {
  const user = await prisma.user.findFirst({ where: { id } });

  return {
    id: user?.id as string,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
  };
}

export async function getUserWorkData(id: string) {
  return await prisma.$transaction(async (ctx) => {
    const employee = await ctx.employee.findFirst({
      where: {
        employeeId: id,
      },
    });

    const userWorkData = await ctx.employeeWorkData.findFirst({
      where: {
        employeeId: employee?.id,
      },
    });

    return userWorkData;
  });
}
