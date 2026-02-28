"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { getRecipeForItem } from "@/lib/pos-recipes";

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

    return { success: true, data: reports };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function upsertInventoryReport(
  userId: string,
  data: {
    reportType: string;
    periodMonth: string;
    periodYear: string;
    productName: string;
    accountRecognition: string;
    unitOfMeasurement: string;
    quantity: number;
    itemsUsed: number;
    itemsLeft: number;
  },
) {
  const store = await getStoreForUser(userId);
  if (!store) return { success: false, message: "Store not found" };

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
        quantity: data.quantity,
        itemsUsed: data.itemsUsed,
        itemsLeft: data.itemsLeft,
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
        quantity: data.quantity,
        itemsUsed: data.itemsUsed,
        itemsLeft: data.itemsLeft,
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
 * After a POS sale, update Submitted Inventory Reports (InventoryReport) for each
 * recipe ingredient so buns/patty etc. show up with used and remaining.
 * Call this after deductRecipeFromStoreInventory so store inventory is already deducted.
 */
export async function syncInventoryReportFromPOS(
  storeId: string,
  itemName: string,
  quantitySold: number,
): Promise<void> {
  const recipe = getRecipeForItem(itemName);
  if (!recipe || recipe.length === 0) return;

  const now = new Date();
  const periodMonth = now.toISOString().split("T")[0];
  const periodYear = now.getFullYear().toString();
  const reportType = "Daily";

  for (const ing of recipe) {
    const amountUsed = Math.round(ing.quantity * quantitySold);
    if (amountUsed <= 0) continue;

    const rows = await prisma.inventory.findMany({
      where: {
        storeId,
        OR: [
          {
            productNameGeneral: {
              contains: ing.productKey,
              mode: "insensitive",
            },
          },
          {
            productNameSpecific: {
              contains: ing.productKey,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    const currentRemaining = rows.reduce((s, r) => s + r.quantity, 0);
    // Always use recipe productKey so one report per ingredient (patty, buns) - matches deduction logic
    const productName = ing.productKey;
    const accountRecognition = rows[0]?.accountRecognition ?? "Food Supplies";
    const unitOfMeasurement = rows[0]?.unitOfMeasurement ?? ing.unit;

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

      const newItemsUsed = (existing?.itemsUsed ?? 0) + amountUsed;
      const initialQty = existing?.quantity ?? currentRemaining + amountUsed;

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
          itemsUsed: newItemsUsed,
          itemsLeft: currentRemaining,
          quantity: initialQty,
          accountRecognition,
          unitOfMeasurement,
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
          quantity: initialQty,
          itemsUsed: amountUsed,
          itemsLeft: currentRemaining,
          createdAt: new Date(currentNow()),
        },
      });
    } catch (err) {
      console.error(`syncInventoryReportFromPOS: ${ing.productKey}`, err);
      // continue to next ingredient so patty failing doesn't block buns
    }
  }
}
