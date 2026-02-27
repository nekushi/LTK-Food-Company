"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

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

// Normalize optional string fields for Prisma (empty string -> null for optional fields)
function optStr(val: string | null | undefined): string | null {
  if (val == null || val === "") return null;
  return val;
}

export async function requestItems(cart: MergedItemReturnTypeInventory[]) {
  if (!cart || cart.length === 0) {
    return { success: false, message: "Cart is empty." };
  }

  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return {
      success: false,
      message: "Session expired. Please log in again.",
    };
  }

  const whoRequested = await prisma.store.findUnique({
    where: { userId: payload.userId as string },
  });

  if (!whoRequested) {
    return {
      success: false,
      message: "Store account not found. Please log in again.",
    };
  }

  try {
    for (const c of cart) {
      await prisma.requestedItems.create({
        data: {
          periodMonth: c.periodMonth,
          periodYear: c.periodYear,
          supplierName: c.supplierName,
          tinNumber: optStr(c.tinNumber),
          typeOfVatTaxpayer: optStr(c.typeOfVatTaxpayer),
          typeOfStocks: c.typeOfStocks,
          itemCode: optStr(c.itemCode),
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
    }

    return {
      success: true,
      message: "Items requested successfully",
    };
  } catch (error) {
    console.error("requestItems error:", error);
    const errMsg =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: process.env.NODE_ENV === "development"
        ? `Request failed: ${errMsg}`
        : "Something went wrong. Try again.",
    };
  }
}
