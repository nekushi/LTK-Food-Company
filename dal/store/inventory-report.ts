"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { getPortionSizeForProduct } from "@/lib/pos-recipes";

function roundToPortion(value: number, portion: number): number {
  if (portion <= 0) return value;
  return Math.round(value / portion) * portion;
}

async function getStoreForUser(userId: string) {
  if (!userId) return null;

  return prisma.store.findUnique({
    where: { userId },
  });
}

export async function getInventoryReports(userId: string) {
  const store = await getStoreForUser(userId);
  if (!store) return { success: false, data: [] };

  try {
    const reports = await prisma.inventoryReport.findMany({
      where: { storeId: store.id },
      orderBy: [{ periodYear: "desc" }, { createdAt: "desc" }],
    });

    const data = reports.map((r) => {
      const portion = getPortionSizeForProduct(r.productName);
      const usePortion = portion != null && (r.unitOfMeasurement === "g" || r.unitOfMeasurement === "mL");
      if (usePortion && portion != null) {
        return {
          ...r,
          quantity: roundToPortion(r.quantity, portion),
          itemsUsed: roundToPortion(r.itemsUsed, portion),
          itemsLeft: roundToPortion(r.itemsLeft, portion),
        };
      }
      return r;
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function upsertInventoryReport(userId: string, data: {
  reportType: string;
  periodMonth: string;
  periodYear: string;
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  itemsUsed: number;
  itemsLeft: number;
}) {
  const store = await getStoreForUser(userId);
  if (!store) return { success: false, message: "Store not found" };

  const portion = getPortionSizeForProduct(data.productName);
  const usePortion = portion != null && (data.unitOfMeasurement === "g" || data.unitOfMeasurement === "mL");
  let quantity = data.quantity;
  let itemsUsed = data.itemsUsed;
  let itemsLeft = data.itemsLeft;
  if (usePortion && portion != null) {
    quantity = roundToPortion(quantity, portion);
    itemsUsed = roundToPortion(itemsUsed, portion);
    itemsLeft = roundToPortion(itemsLeft, portion);
  }

  try {
    const report = await prisma.inventoryReport.upsert({
      where: {
        storeId_periodMonth_periodYear_reportType_productName: {
          storeId: store.id,
          reportType: data.reportType,
          periodMonth: data.periodMonth,
          periodYear: data.periodYear,
          productName: data.productName,
        },
      },
      update: {
        accountRecognition: data.accountRecognition,
        unitOfMeasurement: data.unitOfMeasurement,
        quantity,
        itemsUsed,
        itemsLeft,
        updatedAt: new Date(currentNow()),
      },
      create: {
        storeId: store.id,
        reportType: data.reportType,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        productName: data.productName,
        accountRecognition: data.accountRecognition,
        unitOfMeasurement: data.unitOfMeasurement,
        quantity,
        itemsUsed,
        itemsLeft,
        createdAt: new Date(currentNow()),
      },
    });

    return {
      success: true,
      message: "Inventory report saved successfully",
      data: report,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save inventory report" };
  }
}

/**
 * Record a POS deduction into the store's inventory report (Daily) so that
 * /store/sales-report inventory report section reflects what was used.
 * Call from deductRecipeFromStoreInventory when deducting from Inventory.
 */
export async function recordPOSDeductionToInventoryReport(
  storeId: string,
  productName: string,
  accountRecognition: string,
  unitOfMeasurement: string,
  amountDeducted: number,
): Promise<void> {
  if (amountDeducted <= 0) return;
  const now = new Date(currentNow());
  const periodMonth = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const periodYear = now.getFullYear().toString();
  const reportType = "Daily";

  try {
    const existing = await prisma.inventoryReport.findUnique({
      where: {
        storeId_periodMonth_periodYear_reportType_productName: {
          storeId,
          periodMonth,
          periodYear,
          reportType,
          productName,
        },
      },
    });

    let quantity = existing?.quantity ?? 0;
    const prevUsed = existing?.itemsUsed ?? 0;
    let newItemsUsed = prevUsed + amountDeducted;
    let newItemsLeft = Math.max(0, quantity - newItemsUsed);

    const portion = getPortionSizeForProduct(productName);
    if (portion != null && (unitOfMeasurement === "g" || unitOfMeasurement === "mL")) {
      quantity = roundToPortion(quantity, portion);
      newItemsUsed = roundToPortion(newItemsUsed, portion);
      newItemsLeft = roundToPortion(newItemsLeft, portion);
    }

    await prisma.inventoryReport.upsert({
      where: {
        storeId_periodMonth_periodYear_reportType_productName: {
          storeId,
          periodMonth,
          periodYear,
          reportType,
          productName,
        },
      },
      update: {
        accountRecognition,
        unitOfMeasurement,
        quantity,
        itemsUsed: newItemsUsed,
        itemsLeft: newItemsLeft,
        updatedAt: new Date(currentNow()),
      },
      create: {
        storeId,
        reportType,
        periodMonth,
        periodYear,
        productName,
        accountRecognition,
        unitOfMeasurement,
        quantity: 0,
        itemsUsed: portion != null && (unitOfMeasurement === "g" || unitOfMeasurement === "mL") ? roundToPortion(amountDeducted, portion) : amountDeducted,
        itemsLeft: 0,
        createdAt: new Date(currentNow()),
      },
    });
  } catch (error) {
    console.error("recordPOSDeductionToInventoryReport", error);
  }
}
