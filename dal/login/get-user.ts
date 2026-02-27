"use server";

import { loginSchema } from "@/schemas/login.schema";
import prisma from "@/lib/db";
import z from "zod";
import bcrypt from "bcrypt";

type UserData = z.infer<typeof loginSchema>;

export async function getUser(data: UserData): Promise<any> {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    return {
      success: "validation_error",
      errors: tree,
    };
  }

  const userData = {
    username: data.username,
    password: data.password,
  };

  const findUser = await prisma.account.findFirst({
    where: { username: userData.username },
  });

  if (!findUser) {
    return {
      success: false,
      message: "No user found.",
    };
  }

  const passwordMatched = await bcrypt.compare(
    userData.password,
    findUser.password,
  );

  if (!passwordMatched) {
    return {
      success: false,
      message: "No user found",
    };
  }

  return {
    success: true,
    userId: findUser.id,
    username: findUser.username,
    firstName: findUser.firstName,
    lastName: findUser.lastName,
    role: findUser.role,
  };
}
