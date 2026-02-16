"use server";

import { ItemsReturnTypeStore } from "./get-items";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt, SessionPayload } from "@/lib/session";

export async function requestItems(cart: ItemsReturnTypeStore[]) {
  console.log(`Requesting items`);

  console.log(cart);

  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  //   if (!payload)
  //     return {
  //       success: false,
  //       message: "Something went wrong",
  //     };

  //   const userId = payload?.userId

  const whoRequested = await prisma.store.findUnique({
    where: {
      userId: payload?.userId,
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
      await prisma.requestedItems.create({
        data: {
          productNameGeneral: c.productNameGeneral,
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
    return {
      success: false,
      message: "Something went wrong. Try again.",
    };
  }
}
