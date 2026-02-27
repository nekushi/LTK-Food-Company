"use server";

import { loginSchema } from "@/schemas/login.schema";
import prisma from "@/lib/db";
import z from "zod";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

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
  const role = findUser.role;

  console.log(`role`);
  console.log(role);

  // Keep server-side session for existing flows.
  // await createSession(findUser.id, findUser.username, findUser.role);

  // Find storeId (if any) so the client can persist it in localStorage.
  let storeId: string | null = null;
  if (role === "STORE") {
    const store = await prisma.store.findUnique({
      where: { userId: findUser.id },
      select: { id: true },
    });
    storeId = store?.id ?? null;
  }

  let redirectUrl = "/";
  if (role === "HR") {
    redirectUrl = "/hr";
  } else if (role === "ADMIN") {
    redirectUrl = "/admin";
  } else if (role === "INVENTORY") {
    redirectUrl = "/inventory";
  } else if (role === "DELIVERY") {
    redirectUrl = "/delivery";
  } else if (role === "STORE") {
    redirectUrl = "/store";
  }

  return {
    success: true,
    userId: findUser.id,
    username: findUser.username,
    role,
    storeId,
    redirectUrl,
  };
}

export async function logout() {
  // const myCookie = await cookies();
  // const userId = myCookie.get("userId")?.value;
  // const username = myCookie.get("username")?.value;
  // const role = myCookie.get("role")?.value;

  // await deleteSession();

  redirect("/login");
}
