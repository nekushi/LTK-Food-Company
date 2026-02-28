"use server";

import prisma from "@/lib/db";

/** Central inventory only (admin item-list). Excludes store-specific inventory from initial allocation / issued stocks. */
export async function getItemsInventory() {
  console.log(`Fetching items`);

  const items = await prisma.inventory.findMany({
    where: {
      quantity: { gt: 0 },
      storeId: null,
    },
    orderBy: { createdAt: "desc" },
  });

  const forIventory = items.map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    vatable: Number(item.vatable),
    vat: Number(item.vat),
    ewt: Number(item.ewt),
    netPay: Number(item.netPay),
  }));

  return forIventory;
}

export async function getItemsStore() {
  console.log(`Fetching items`);

  // Filter out items with quantity <= 0 - they should not be visible to stores
  const items = await prisma.inventory.findMany({
    where: {
      quantity: { gt: 0 },
    },
  });

  const forStore = items.map((item) => ({
    id: item.id,
    productNameGeneral: item.productNameGeneral,
    quantity: item.quantity,
    unitOfMeasurement: item.unitOfMeasurement,
    accountRecognition: item.accountRecognition,
  }));

  return forStore;
}

export type ItemsReturnTypeInventory = {
  unitPrice: number;
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  periodMonth: string;
  periodYear: string;
  supplierName: string;
  tinNumber: string | null;
  typeOfVatTaxpayer: string | null;
  typeOfStocks: string;
  productNameSpecific: string;
  productNameGeneral: string;
  itemCode: string | null;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
};

export type ItemsReturnTypeStore = {
  id: string;
  productNameGeneral: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
};
