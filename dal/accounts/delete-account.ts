"use server";

import prisma from "@/lib/db";

export async function deleteAccount(id: string) {
  try {
    return await prisma.$transaction(async (ctx) => {
      const account = await ctx.account.findUnique({ where: { id } });
      if (!account) throw new Error("Account not found");

      // Clean up relations first due to foreign key constraints
      if (account.role === "HR") {
        await ctx.humanResource.deleteMany({ where: { userId: id } });
      } else if (account.role === "INVENTORY") {
        await ctx.inventoryManager.deleteMany({ where: { userId: id } });
      } else if (account.role === "STORE") {
        await ctx.store.deleteMany({ where: { userId: id } });
      } else if (account.role === "DELIVERY") {
        await ctx.delivery.deleteMany({ where: { userId: id } });
      }

      await ctx.account.delete({ where: { id } });

      return { success: true, message: "Account deleted successfully" };
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return { success: false, message: error.message || "Failed to delete account" };
  }
}
