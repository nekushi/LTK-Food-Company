"use server";

import prisma from "@/lib/db";

export async function getBranchInventory() {
  console.log(`Fetching branch inventory`);

  const items = await prisma.inventory.findMany({
    where: {
      typeOfStocks: "Issued Stocks",
      // You can also filter by supplierName here to match the branch, e.g., if we extract from user session
    },
    orderBy: { createdAt: "desc" },
  });

  const branchInventory = items.map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    vatable: Number(item.vatable),
    vat: Number(item.vat),
    ewt: Number(item.ewt),
    netPay: Number(item.netPay),
  }));

  return branchInventory;
}
