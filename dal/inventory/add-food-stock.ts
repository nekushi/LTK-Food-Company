"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { revalidatePath } from "next/cache";

export async function addFoodStock(data: {
  foodName: string;
  quantity: number;
  beginningStock: number;
  additionalStock: number;
  issuedStock: number;
  status: string;
}) {
  try {
    const today = new Date();
    const periodMonth = String(today.getMonth() + 1).padStart(2, "0");
    const periodYear = String(today.getFullYear());

    // Beginning Stock
    if (data.beginningStock > 0) {
      await prisma.inventory.create({
        data: {
          periodMonth,
          periodYear,
          supplierName: "Food Stock Entry", 
          typeOfStocks: "Beginning Stocks",
          productNameGeneral: data.foodName,
          productNameSpecific: data.foodName,
          accountRecognition: "Food Stock",
          unitOfMeasurement: "pcs", 
          quantity: data.beginningStock,
          unitPrice: 0, 
          totalPrice: 0,
          vatable: 0,
          vat: 0,
          ewt: 0,
          netPay: 0,
          status: data.status,
          createdAt: new Date(currentNow()),
        },
      });
    }

    // Additional Stock
    if (data.additionalStock > 0) {
      await prisma.inventory.create({
        data: {
          periodMonth,
          periodYear,
          supplierName: "Food Stock Entry",
          typeOfStocks: "Additional Stocks",
          productNameGeneral: data.foodName,
          productNameSpecific: data.foodName,
          accountRecognition: "Food Stock",
          unitOfMeasurement: "pcs",
          quantity: data.additionalStock,
          unitPrice: 0,
          totalPrice: 0,
          vatable: 0,
          vat: 0,
          ewt: 0,
          netPay: 0,
          status: data.status,
          createdAt: new Date(currentNow()),
        },
      });
    }

    // Issued Stock
    if (data.issuedStock > 0) {
      await prisma.inventory.create({
        data: {
          periodMonth,
          periodYear,
          supplierName: "Food Stock Entry",
          typeOfStocks: "Issued Stocks",
          productNameGeneral: data.foodName,
          productNameSpecific: data.foodName,
          accountRecognition: "Food Stock",
          unitOfMeasurement: "pcs",
          quantity: data.issuedStock,
          unitPrice: 0,
          totalPrice: 0,
          vatable: 0,
          vat: 0,
          ewt: 0,
          netPay: 0,
          status: data.status,
          createdAt: new Date(currentNow()),
        },
      });
    }

    revalidatePath("/inventory/food-stock");
    return { success: true, message: "Food stock saved." };
  } catch (error) {
    console.error("Error saving food stock:", error);
    return { success: false, message: "Failed to save food stock." };
  }
}
