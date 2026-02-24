"use server";

import { loginSchema } from "@/schemas/login.schema";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
// import { redirect } from "next/dist/server/api-utils";
import z, { success } from "zod";

import bcrypt from "bcrypt";
import { createSession, deleteSession } from "@/lib/session";
import { cookies } from "next/headers";

type UserData = z.infer<typeof loginSchema>;

// export async function getUser(data: UserData) {
//   console.log(`Logging in`);
// }

// type Login =
//   | { success: boolean; message: string }
//   | { success: string; errors: any | undefined };

export async function getUser(data: UserData): Promise<any> {
  console.log(`Logging in`);

  const result = loginSchema.safeParse(data);

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

  console.log(`findUser`);
  console.log(findUser);

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
  // await createSession(findUser.id, findUser.username, findUser.email);
  const role = findUser.role;

  console.log(`role`);
  console.log(role);

  await createSession(findUser.id, findUser.username, findUser.role);

  if (role === "HR") {
    redirect("/hr");
  } else if (role === "ADMIN") {
    redirect("/admin");
  } else if (role === "INVENTORY") {
    redirect("/inventory");
  } else if (role === "DELIVERY") {
    redirect("/delivery");
  } else if (role === "STORE") {
    redirect("/store");
  } else {
    redirect("/");
  }
}

export async function logout() {
  // const myCookie = await cookies();
  // const userId = myCookie.get("userId")?.value;
  // const username = myCookie.get("username")?.value;
  // const role = myCookie.get("role")?.value;

  await deleteSession();

  redirect("/login");
}
