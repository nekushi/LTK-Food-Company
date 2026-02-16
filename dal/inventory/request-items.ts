"use server";

import { success } from "zod";
import { ItemsReturnTypeStore } from "./get-items";
import prisma from "@/lib/db";

// export async function requestItems(cart: ItemsReturnTypeStore[]) {
//   return "nice";
// }

export async function requestItems(cart: ItemsReturnTypeStore[]) {
  console.log(`Requesting items`);

  try {
    cart.forEach(async (c: ItemsReturnTypeStore) => {
      const requestedItems = await prisma.requestedItems.create({
        data: {
          productNameGeneral: c.productNameGeneral,
          quantity: c.quantity,
          accountRecognition: c.accountRecognition,
          unitOfMeasurement: c.unitOfMeasurement,
          //   requestId:
        },
      });
    });

    return {
      success: "success",
      message: "Items requested successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong. Try again.",
    };
  }

  //   const items = await prisma.inventory.findMany();

  //   const forIventory = items.map((item) => ({
  //     ...item,
  //     unitPrice: Number(item.unitPrice),
  //     totalPrice: Number(item.totalPrice),
  //     vatable: Number(item.vatable),
  //     vat: Number(item.vat),
  //     ewt: Number(item.ewt),
  //     netPay: Number(item.netPay),
  //   }));

  //   return forIventory;
}
