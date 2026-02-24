"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function getBranchInventory() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) return [];

  const store = await prisma.store.findUnique({
    where: { userId: payload.userId as string },
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
