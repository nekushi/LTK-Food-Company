"use server";

import { Role } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

export async function addUser(prevState: unknown, formdata: FormData) {
  const firstName = formdata.get("firstName") as string;
  const lastName = formdata.get("lastName") as string;
  const username = formdata.get("username") as string;
  const password = formdata.get("password") as string;
  const role = formdata.get("role") as Role;
  const employeeId = formdata.get("employeeId") as string;

  return await prisma.$transaction(async (ctx) => {
    const user = await ctx.user.create({
      data: {
        firstName,
        lastName,
        username,
        password,
        role,
      },
    });

    if (user.role === Role.EMPLOYEE) {
      await ctx.employee.create({
        data: {
          userId: user.id,
          employeeId,
        },
      });
    } else if (user.role === Role.DELIVERY_PERSONNEL) {
      await ctx.deliveryPersonnel.create({
        data: {
          userId: user.id,
        },
      });
    } else if (user.role === Role.STOCK_MANAGER) {
      await ctx.stockManager.create({
        data: {
          userId: user.id,
        },
      });
    } else if (user.role === Role.HUMAN_RESOURCE) {
      await ctx.humanResource.create({
        data: {
          userId: user.id,
        },
      });
    }

    console.log(user);
    return user;
  });
}
