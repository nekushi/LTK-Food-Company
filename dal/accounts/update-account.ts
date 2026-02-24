"use server";

import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";

const updateAccountSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  roleId: z.string().optional(),
});

type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export async function updateAccount(data: UpdateAccountInput) {
  try {
    const parsed = updateAccountSchema.parse(data);

    const updateData: any = {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      username: parsed.username,
      roleId: parsed.roleId,
    };

    if (parsed.password && parsed.password.trim() !== "") {
      updateData.password = await bcrypt.hash(parsed.password, 10);
    }

    await prisma.account.update({
      where: { id: parsed.id },
      data: updateData,
    });

    return { success: true, message: "Account updated successfully" };
  } catch (error: any) {
    console.error("Update account error:", error);
    return { success: false, message: error.message || "Failed to update account" };
  }
}
