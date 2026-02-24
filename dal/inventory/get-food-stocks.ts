"use server";

import prisma from "@/lib/db";

export async function getFoodStocks() {
  console.log(`Fetching food stocks`);

  const items = await prisma.inventory.findMany({
    where: { accountRecognition: "Food Stock" },
    orderBy: { createdAt: "desc" },
  });

  const formatted = items.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
  }));

  return formatted;
}
