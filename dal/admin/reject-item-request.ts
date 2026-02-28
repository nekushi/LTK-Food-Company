"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

export async function rejectItemRequest(itemIds: string[], note: string) {
  try {
    await prisma.requestedItems.updateMany({
      where: { id: { in: itemIds } },
      data: {
        status: "rejected",
        note,
        updatedAt: new Date(currentNow()),
      },
    });

    return { success: true, message: "Item request rejected" };
  } catch (error) {
    console.error("Failed to reject item request:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}
