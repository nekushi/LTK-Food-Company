"use server";

import prisma from "@/lib/db";

export async function getBranchInventory(userId: string) {
  if (!userId) return [];

  const store = await prisma.store.findUnique({
    where: { userId },
  });

  if (!store) return [];

  const items = await prisma.requestedItems.findMany({
    where: {
      storeId: store.id,
      isRequestApproved: true,
      status: { in: ["to be delivered", "on the way", "success"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    periodMonth: item.periodMonth,
    periodYear: item.periodYear,
    supplierName: item.supplierName,
    tinNumber: item.tinNumber,
    typeOfVatTaxpayer: item.typeOfVatTaxpayer,
    typeOfStocks: item.typeOfStocks,
    productNameSpecific: item.productNameSpecific,
    productNameGeneral: item.productNameGeneral,
    itemCode: item.itemCode,
    accountRecognition: item.accountRecognition,
    unitOfMeasurement: item.unitOfMeasurement,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    vatable: item.vatable,
    vat: item.vat,
    ewt: item.ewt,
    netPay: item.netPay,
    status: item.status,
  }));
}
