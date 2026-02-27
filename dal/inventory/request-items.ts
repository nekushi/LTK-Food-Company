"use server";

import { ItemsReturnTypeStore } from "./get-items";
import prisma from "@/lib/db";

export type RestItemsReturnTypeInventory = {
  periodMonth: string;
  periodYear: string;
  supplierName: string;
  tinNumber: string;
  typeOfVatTaxpayer: string;
  typeOfStocks: string;
  productNameSpecific: string;
  itemCode: string;
  unitPrice: number;
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
};

export interface MergedItemReturnTypeInventory extends RestItemsReturnTypeInventory {
  id: string;
  productNameGeneral: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
}

export async function requestItems(cart: MergedItemReturnTypeInventory[], userId: string) {
  const whoRequested = await prisma.store.findUnique({
    where: {
      userId,
    },
  });

  console.log(`whoRequested`);
  console.log(whoRequested);

  if (!whoRequested)
    return {
      success: false,
      message: "Account not found.",
    };

  try {
    for (const c of cart) {
      const reqItems = await prisma.requestedItems.create({
        data: {
          periodMonth: c.periodMonth,
          periodYear: c.periodYear,
          supplierName: c.supplierName,
          tinNumber: c.tinNumber,
          typeOfVatTaxpayer: c.typeOfVatTaxpayer,
          typeOfStocks: c.typeOfStocks,
          itemCode: c.itemCode,
          unitPrice: c.unitPrice,
          totalPrice: c.totalPrice,
          vatable: c.vatable,
          vat: c.vat,
          ewt: c.ewt,
          netPay: c.netPay,
          productNameGeneral: c.productNameGeneral,
          productNameSpecific: c.productNameSpecific,
          quantity: c.quantity,
          accountRecognition: c.accountRecognition,
          unitOfMeasurement: c.unitOfMeasurement,
          storeId: whoRequested.id,
        },
      });

      console.log(reqItems);
    }

    return {
      success: true,
      message: "Items requested successfully",
    };
  } catch (error) {
    // throw new Error (error)
    console.log(error);

    return {
      success: false,
      message: "Something went wrong. Try again.",
    };
  }
}
