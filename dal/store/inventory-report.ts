"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

async function getStoreForCurrentUser() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) return null;

  return prisma.store.findUnique({
    where: { userId: payload.userId as string },
  });
}

export async function getInventoryReports() {
  const store = await getStoreForCurrentUser();
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

export async function upsertInventoryReport(data: {
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
  const store = await getStoreForCurrentUser();
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
