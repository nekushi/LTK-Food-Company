"use server";

import prisma from "@/lib/db";

export type RequestedItemPersistent = {
  id: string;
  productNameGeneral: string;
  quantity: number;
  accountRecognition: string;
  unitOfMeasurement: string;
  storeId: string;
};

export async function getRequestedItemsWithStore(): Promise<
  RequestedItemPersistent[]
> {
  const requestedItems = await prisma.requestedItems.findMany({
    orderBy: { id: "desc" },
  });

  return requestedItems.map((item) => ({
    id: item.id,
    productNameGeneral: item.productNameGeneral,
    quantity: item.quantity,
    accountRecognition: item.accountRecognition,
    unitOfMeasurement: item.unitOfMeasurement,
    storeId: item.storeId,
  }));
}

