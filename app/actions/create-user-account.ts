"use server";

import z, { success } from "zod";
import prisma from "@/lib/db";
import { CreateAccountResponse } from "@/index";

import bcrypt from "bcrypt";
import { accountSchema } from "../schemas/account.schema";

type TypeUserAccount = z.infer<typeof accountSchema>;

export async function createUserAccount(data: TypeUserAccount): Promise<any> {
  console.log("Creating an account");

  const result = accountSchema.safeParse(data);

  console.log(result);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    // console.log(tree);

    return {
      success: "validation_error",
      errors: tree,
      //   errors: result.error.flatten().fieldErrors,
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: hashedPassword,
      role: data.role,
    };

    const user = await prisma.account.create({
      data: userData,
    });

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
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
