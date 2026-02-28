"use server";

import prisma from "@/lib/db";

function mapToBranchItem(item: {
  id: string;
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
  unitPrice: number;
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
  status: string | null;
}) {
  return {
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
  };
}

export async function getBranchInventory(userId: string) {
  if (!userId) return [];

  const store = await prisma.store.findUnique({
    where: { userId },
  });

  if (!store) return [];

  const [requestItems, storeInventory] = await Promise.all([
    prisma.requestedItems.findMany({
      where: {
        storeId: store.id,
        isRequestApproved: true,
        status: { in: ["to be delivered", "on the way", "success"] },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventory.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const fromRequests = requestItems.map((item) =>
    mapToBranchItem({
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
    }),
  );

  const fromInventory = storeInventory.map((item) =>
    mapToBranchItem({
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
    }),
  );

  return [...fromRequests, ...fromInventory];
}
