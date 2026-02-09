"use server";

import prisma from "@/lib/db";

export async function getAllUsers() {
  const users = await prisma.user.findMany();

  return users;
}

export async function getUser(id: string) {
  const user = await prisma.employee.findFirst({
    where: {
      userId: id,
    },
  });

  return user;
}

export async function getUserWorkData(id: string) {
  const userWorkData = await prisma.employeeWorkData.findFirst({
    where: {
      employeeId: id,
    },
  });

  return userWorkData;
}
