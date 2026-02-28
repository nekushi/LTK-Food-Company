"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

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
