"use server";

import z, { success } from "zod";
import prisma from "@/lib/db";
import { CreateAccountResponse } from "@/index";

import bcrypt from "bcrypt";
import { accountSchema } from "@/schemas/account.schema";

type TypeUserAccount = z.infer<typeof accountSchema>;

export async function createUserAccount(data: TypeUserAccount): Promise<any> {
  console.log("Creating an account");

  const result = accountSchema.safeParse(data);

  if (!result.success) {
    const tree = z.treeifyError(result.error);

    return {
      success: "validation_error",
      errors: tree,
    };
  }

  // const { username, password } = result.data

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: hashedPassword,
      role: data.role,
    };

    console.log(userData.role);

    return await prisma.$transaction(async (ctx) => {
      const user = await ctx.account.create({
        data: userData,
      });

      if (user.role === "HR") {
        await ctx.humanResource.create({
          data: {
            userId: user.id,
          },
        });
      } else if (user.role === "INVENTORY") {
        await ctx.inventoryManager.create({
          data: {
            userId: user.id,
          },
        });
      } else if (user.role === "STORE") {
        await ctx.store.create({
          data: {
            userId: user.id,
          },
        });
      } else if (user.role === "DELIVERY") {
        await ctx.delivery.create({
          data: {
            userId: user.id,
          },
        });
      }

      return {
        success: "success",
        user: {
          firstName: user["firstName"],
          lastName: user["lastName"],
          username: user["username"],
          role: user["role"],
        },
        message: "Account created successfully",
      };
    });
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
